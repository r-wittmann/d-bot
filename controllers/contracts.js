const {getParticipationMessage} = require("../messageGenerators/participationMessage.js");
const {getPlayerByEiId} = require("../services/auxbrain/player.js");
const {log} = require("../services/logService.js");
const {getMembers} = require("../services/dataAccess/database.js");
const {getAllContractsList} = require("../services/dataAccess/auxbrainApi.js");

exports.checkParticipation = async (message, contractId) => {

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
        await log(message.client, "Contract id verified.");
    } catch (e) {
        throw e;
    }

    // get members from database
    let members;
    try {
        members = await getMembers();
        await log(message.client, "Members queried from database.");
    } catch (e) {
        throw e;
    }

    // get backup for each member
    let membersWithContracts;
    try {
        membersWithContracts = await getParticipatedContracts(members);
        await log(message.client, "Participated contracts queried from auxbrain for each member.")
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

    // construct message
    await message.channel.send(getParticipationMessage(contractId, completedList, activeList, needToJoinList));
    await log(message.client, `Participation was checked for contract \`${contractId}\``);
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

