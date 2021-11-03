const {
    getActiveMessage,
    getCompletedMessage,
    getNeedToJoinMessage
} = require("../messageGenerators/participationMessage.js");
const {getAllContractsList, getMatchingContract, getPlayerByEiId} = require("../services/dataAccess/auxbrainApi.js");
const {getAssignCoopTeamsMessage} = require("../messageGenerators/assignCoopTeamsMessage.js");
const {calculateEarningsBonus} = require("../services/utils.js");
const {log} = require("../services/logService.js");
const {getMembers} = require("../services/dataAccess/database.js");

exports.checkParticipation = async (interaction, contractId) => {

    // check for the existence of contract id
    let matchingContract;
    try {
        const contracts = await getAllContractsList();
        matchingContract = contracts.find(
            contract => {
                return contract.id === contractId
            }
        );
        if (!matchingContract) {
            // provided contract id is not in the available contracts
            throw new Error(`Contract with id \`${contractId}\` was not found.`);
        }
    } catch (e) {
        throw e;
    }

    // get members from database
    let members;
    try {
        members = await getMembers();
    } catch (e) {
        throw e;
    }

    // get backup for each member
    let membersWithContracts;
    try {
        membersWithContracts = await getParticipatedContracts(members);
    } catch (e) {
        throw e;
    }

    // check contract status in backup for each member
    const completedList = [];
    const activeList = [];
    const needToJoinList = [];

    memberLoop:
        for (const member of membersWithContracts) {
            // check for the contract id in the activeContracts
            for (const activeContract of member.activeContracts) {
                if (activeContract.contractId === contractId) {
                    if (activeContract.coopCode) {
                        activeList.push({
                            inGameName: member.inGameName,
                            coopCode: activeContract.coopCode,
                        });
                        continue memberLoop;
                    } else {
                        needToJoinList.push(member.inGameName);
                        continue memberLoop;
                    }
                }
            }
            // check for contract id in archivedContracts and check for completion
            for (const archivedContract of member.archivedContracts) {
                if (archivedContract.contractId === contractId && archivedContract.completed) {
                    completedList.push(member.inGameName);
                    continue memberLoop;
                }
            }
            needToJoinList.push(member.inGameName);
        }

    // create embeds
    const embeds = []
    // get completed message embed
    embeds.push(getCompletedMessage(contractId, completedList));
    // get active message embeds
    embeds.push(...getActiveMessage(contractId, activeList))
    // get completed message embed
    embeds.push(getNeedToJoinMessage(contractId, needToJoinList));

    await interaction.editReply({embeds});
}

exports.assignCoopTeams = async (interaction, contractId) => {

    // get matching contract
    let assignableContract;
    assignableContract = await getMatchingContract(contractId);
    if (!assignableContract) {
        throw new Error(`No contract found for contract id \`${contractId}\``)
    }

    // get previous contracts
    let previousContracts = await getAllContractsList();
    previousContracts = previousContracts.slice(-13);
    previousContracts = previousContracts.map(contract => contract.id);

    // get all members and check completion status
    let updatedMembers = [];
    try {
        const members = await getMembers();

        // get player info from auxbrain API
        for (let member of members) {
            const player = await getPlayerByEiId(member.eiId);
            member = Object.assign({}, member.toObject(), {backup: player.backup});
            updatedMembers.push(member);
        }
    } catch (e) {
        throw e;
    }

    // calculate EB for all players
    updatedMembers = updatedMembers.map(member => {
        const earningsBonus = calculateEarningsBonus(member.backup);
        return Object.assign({}, member, {earningsBonus});
    });

    // filter out members that have already completed the contract
    updatedMembers = updatedMembers.filter(member => {
        const archivedContracts = member.backup.contracts.archive;
        let notCompleted = true;

        // loop through archived contracts, search for the contract id and check if it was completed
        for (const archivedContract of archivedContracts) {
            const archiveContractId = archivedContract.contract.identifier;
            const numGoals = archivedContract.contract.goals.length;
            const goalsAchieved = archivedContract.numGoalsAchieved;
            if (archiveContractId === contractId && numGoals === goalsAchieved) {
                notCompleted = false;
                break;
            }
        }

        return notCompleted;
    })

    // if there is no one left in the list (everyone has completed the contract), throw an error
    if (updatedMembers.length === 0) {
        throw new Error("All members seem to have completed this contract.");
    }

    // extract contribution potential and add to member object
    updatedMembers = updatedMembers.map(member => {
        // get contract information from the archive, filtering for the relevant contract ids and coopAllowed
        const completedContracts = member.backup.contracts.archive.filter(contract =>
            previousContracts.includes(contract.contract.identifier) &&
            contract.contract.coopAllowed &&
            contract.league === 0
        );
        const contributions = completedContracts.map(contract => {
            return contract.coopLastUploadedContribution / contract.lastAmountWhenRewardGiven || 0.1;
        });

        return Object.assign({}, member, {contributionPotential: contributions.reduce((a, b) => a + b, 0) / contributions.length});
    });

    // sort members by EB
    updatedMembers = updatedMembers.sort((a, b) => a.earningsBonus - b.earningsBonus);

    /**
     * from here on, the groups are assigned
     * parameters are:
     * - updatedMembers: A list of all members participating in this contract, sorted by EB
     * - matchingContract: The contract to extract the coop size and thereby the number of groups needed
     * First, the number of needed groups is calculated based on member count and coop size
     * Each of the groups gets one player assigned, starting with the highest EB
     * After that, we loop through all players and assign them based on contribution potential
     * by assigning the player with the highest cp to the group with the lowest cp, a more or less fair split is performed
     **/

        // calculate the number of coops we need
    const numberOfGroups = Math.ceil(updatedMembers.length / assignableContract.maxCoopSize);

    // create a list of empty lists. use fill(null).map() to create independent arrays
    let groups = new Array(numberOfGroups).fill(null).map(() => []);

    // assign highest EB players to each group
    groups.forEach(group => {
        group.push(updatedMembers.pop());
    })

    // sort remaining players by contribution potential
    updatedMembers = updatedMembers.sort((a, b) => a.contributionPotential - b.contributionPotential);

    // assign remaining players to groups
    while (updatedMembers.length !== 0) {
        groups = groups.sort((a, b) => sumGroupContributionPotential(a) - sumGroupContributionPotential(b));
        groups.forEach(group => {
            if (updatedMembers.length === 0) return;
            group.push(updatedMembers.pop());
        })
    }

    /**
     * This is an extra step for the Malstormes to be in one coop.
     * To prevent underpowered groups, this rule is only feasible for coops bigger than 3
     */
    if (assignableContract.maxCoopSize > 3) {

        const moEI = "EI5927804014690304";
        const m0EI = "EI6566080824213504";
        // find the groups with the respective players
        let moGroup = groups.find(group => {
            for (const member of group) {
                if (member.eiId === moEI) return true;
            }
            return false;
        })
        let m0Group = groups.find(group => {
            for (const member of group) {
                if (member.eiId === m0EI) return true;
            }
            return false;
        })

        // if the malstormes are not in the same group, change that
        if (moGroup && m0Group && moGroup !== m0Group) {
            const m0 = m0Group.find(member => member.eiId === m0EI);
            m0Group.splice(m0Group.indexOf(m0), 1);
            m0Group.push(moGroup.pop());
            moGroup.push(m0);
        }
    }

    // send a message with suggested teams
    await interaction.editReply({embeds: [getAssignCoopTeamsMessage(assignableContract.name, contractId, groups)]});
    // create channels
    for (let i = 0; i < groups.length; i++) {
        const createdChannel = await interaction.guild.channels.create(
            `group-${i + 1}-${contractId}`, {
                type: "text",
                parent: process.env.COOP_CATEGORY_ID,
                position: 100 + i
            }
        );

        // Send instructions and mention the members
        await createdChannel.send(`This is the coop channel for group ${i + 1}. Members are:`);
        for (let member of groups[i]) {
            await createdChannel.send(`<@!${member.discordId}>`);
        }
        await createdChannel.send(`Copy the following command and add your coop code:\n\`/activatecoop contract-id:${contractId} group-number:${i + 1} coop-code: \`\nThis adds your coop to the list of active coops in <#${process.env.ACTIVE_COOP_CHANNEL_ID}>.`);
    }
}


const sumGroupContributionPotential = (group) => {
    return group.reduce((a, b) => a + b.contributionPotential, 0);
}

const getParticipatedContracts = async (members) => {
    const updatedMembers = [];

    for (const member of members) {
        const backup = await getEiPlayerBackup(member.eiId);

        const activeContracts = !backup.contracts.contracts
            ? []
            : backup.contracts.contracts.map(contract => {
                return {
                    contractId: contract.contract.identifier,
                    coopCode: contract.coopIdentifier
                }
            });
        const archivedContracts = backup.contracts.archive;

        // loop through archived contracts to check if they were completed
        const updatedArchivedContracts = [];
        for (const archivedContract of archivedContracts) {
            const contractId = archivedContract.contract.identifier;
            const numGoals = archivedContract.contract.goals.length;
            const goalsAchieved = archivedContract.numGoalsAchieved;
            updatedArchivedContracts.push({
                contractId,
                completed: numGoals === goalsAchieved,
            })
        }

        updatedMembers.push(Object.assign(
            {},
            member.toObject(),
            {activeContracts},
            {archivedContracts: updatedArchivedContracts})
        );
    }

    return updatedMembers;
}

const getEiPlayerBackup = async (eiId) => {
    const playerData = await getPlayerByEiId(eiId);
    return playerData.backup;
}
