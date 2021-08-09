const {getCoopStatusMessage} = require("../messageGenerators/coopStatusMessage.js");
const {getActiveCoopsMessage} = require("../messageGenerators/activeCoopsMessage.js");
const {getCoopStatus, getMatchingContract} = require("../services/dataAccess/auxbrainApi.js");
const {log} = require("../services/logService.js");
const {deleteActiveCoopChannel} = require("../services/dataAccess/discord.js");
const {
    addActiveContract,
    getActiveContractById,
    getActiveContracts,
    updateActiveContract,
    removeActiveContract
} = require("../services/dataAccess/database.js");

exports.activateCoop = async (message, contractId, coopCode, groupNumber) => {
    // coop codes can not be capitalized. Because autocorrect sometimes capitalizes words, we need to decapitalize it
    coopCode = coopCode.toLowerCase();

    if (!groupNumber) {
        throw new Error("You seem to have forgotten an argument. Please provide contract id, coop code and group number");
    }

    // check if contract exists in active contracts
    let activeContract = await getActiveContractById(contractId);
    if (!activeContract) {
        // todo: check if the contract id actually exists
        activeContract = await addActiveContract(contractId);
        await log(message.client, `Contract \`${contractId}\` added to active contracts.`);
    }

    // check, if the coop code already exists in the list of active coops
    if (activeContract.activeCoops.map(c => c.coopCode).includes(coopCode)) {
        throw new Error(`Coop code \`${coopCode}\` already exists for contract \`${contractId}\`.`);
    }

    // add coop to list of active coops
    await updateActiveContract(activeContract.contractId, activeContract.activeCoops.concat([{coopCode, groupNumber}]));
    await log(message.client, `Coop code \`${coopCode}\` added to active coops.`);

    await log(message.client, "Coop activated.");
    await message.channel.send("Coop activated.");

    // call $updateactivecoops to fill active coop message with information
    await log(message.client, "$updateactivecoops");
}

exports.updateActiveCoops = async (message) => {
    // delete calling message
    message.delete();

    // get all active contracts from the database
    const activeContracts = await getActiveContracts();

    // for each contract, get the contract information from github
    const updatedActiveContracts = [];
    for (let activeContract of activeContracts) {
        const contractDetails = await getMatchingContract(activeContract.contractId);
        if (!contractDetails) {
            throw new Error(`A contract with the id \`${activeContract.contractId}\` could not be found`);
        }

        const coopStatusList = [];
        // for each coop, get the coop status from auxbrain
        for (let i = 0; i < activeContract.activeCoops.length; i++) {
            const coopCode = activeContract.activeCoops[i].coopCode;
            const coopStatus = await getCoopStatus(activeContract.contractId, coopCode);
            coopStatusList.push(coopStatus);
        }
        updatedActiveContracts.push(Object.assign(
            {},
            activeContract.toObject(),
            contractDetails,
            {activeCoops: coopStatusList}
        ));
    }

    // get old messages
    const activeCoopChannel = await message.client.channels.cache.get(process.env.ACTIVE_COOP_CHANNEL_ID);
    const channelMessagesMap = await activeCoopChannel.messages.fetch();
    const channelMessages = Array.from(channelMessagesMap.values());
    const oldActiveContractMessages = channelMessages.filter(m => m.embeds && m.embeds.length !== 0);

    // generate new messages
    const activeContractMessages = [];
    for (let activeContract of updatedActiveContracts) {
        activeContractMessages.push(getActiveCoopsMessage(activeContract));
    }

    // edit old messages, as long as they exist
    const numberOfOldMessages = oldActiveContractMessages.length;
    for (let i = 0; i < numberOfOldMessages; i++) {
        if (activeContractMessages.length <= i) break;
        const oldMessage = oldActiveContractMessages.pop();
        const newMessage = activeContractMessages.pop();
        await oldMessage.edit({embed: newMessage});
    }

    // are any new messages left? send them
    if (activeContractMessages.length > 0) {
        for (let m of activeContractMessages) {
            await activeCoopChannel.send({embed: m});
        }
    }

    // are any old messages left? delete them
    if (oldActiveContractMessages.length > 0) {
        for (let m of oldActiveContractMessages) {
            await m.delete();
        }
    }

    await log(message.client, "Active coops updated.");
}

exports.removeActiveCoop = async (message, contractId, coopCode) => {
    // coop codes can not be capitalized. Because autocorrect sometimes capitalizes words, we need to decapitalize it
    coopCode = coopCode.toLowerCase();

    // get matching contract from database
    const activeContract = await getActiveContractById(contractId);
    if (!activeContract) {
        throw new Error(`The contract \`${contractId}\` is not in the list of active contracts.`);
    }

    // if coop is not in the list of active coops, throw
    if (!activeContract.activeCoops.map(c => c.coopCode).includes(coopCode)) {
        throw new Error(`The coop \`${coopCode}\` is not in the list of active coops for contract \`${contractId}\`.`);
    }

    // remove coop code from active coops
    const removableCoop = activeContract.activeCoops.find(coop => coop.coopCode === coopCode);
    const updatedActiveCoops = activeContract.activeCoops.filter(coop => coop.coopCode !== coopCode);
    if (updatedActiveCoops.length > 0) {
        await updateActiveContract(activeContract.contractId, updatedActiveCoops);
        await log(message.client, "Coop removed from active coops.");
        await message.channel.send("Coop removed from active coops.");
    } else {
        await removeActiveContract(contractId);
        await log(message.client, "Coop and contract removed from active coops.");
        await message.channel.send("Coop and contract removed from active coops.");
    }

    // remove coop channel
    await deleteActiveCoopChannel(message, contractId, removableCoop.groupNumber);
    await log(message.client, "Coop channel deleted");

    // add coop to completed coop channel
    const completedCoopChannel = await message.client.channels.cache.get(process.env.COMPLETED_COOP_CHANNEL_ID);
    await completedCoopChannel.send(`${contractId}: \`${coopCode}\``);
    await log(message.client, "Coop added to completed coops");

    // call $updateactivecoops to fill active coop message with information
    await message.channel.send("$updateactivecoops");
}

exports.getCoopStatus = async (message, contractId, coopCode) => {
    // get contract details
    const contractDetails = await getMatchingContract(contractId);
    if (!contractDetails) {
        throw new Error(`No contract found with id: \`${contractId}\``);
    }

    // get coop status
    let coopStatus = await getCoopStatus(contractId, coopCode);
    if (!coopStatus.contributors) {
        throw new Error(`No coop found with code: \`${coopCode}\``)
    }

    await message.channel.send({embed: getCoopStatusMessage(contractDetails, coopStatus)})
}
