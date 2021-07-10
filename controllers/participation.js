const database = require("../services/dataAccess/database.js");
const api = require("../services/dataAccess/auxbrainApi.js");
const {getParticipationMessage} = require("../messageGenerators/participationMessage.js");


exports.getMembers = async () => {
    return await database.getMembers();
}

exports.checkParticipation = async (message, members, contractId) => {
    try {
        // get all contracts all members have participated in
        const membersWithContracts = await getParticipatedContracts(members);

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

        // send message
        await message.channel.send(getParticipationMessage(contractId, completedList, activeList, needToJoinList));

    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }

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
    const playerData = await api.getPlayerByEiId(eiId);
    return playerData.backup;
}
