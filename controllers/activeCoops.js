const {getActiveCoopsChannelHeaderMessage} = require("../messageGenerators/activeCoopsChannelHeader.js");
const {getCoopStatusMessage} = require("../messageGenerators/coopStatusMessage.js");
const {getActiveCoopsMessage} = require("../messageGenerators/activeCoopsMessage.js");
const {getCoopStatus, getMatchingContract} = require("../services/dataAccess/auxbrainApi.js");
const {deleteActiveCoopChannel} = require("../services/dataAccess/discord.js");
const {
    addActiveContract,
    getActiveContractById,
    getActiveContracts,
    updateActiveContract,
    removeActiveContract
} = require("../services/dataAccess/database.js");

exports.setupActiveCoopChannel = async (interaction) => {
    // clear old messages
    const activeCoopChannel = await interaction.client.channels.cache.get(process.env.ACTIVE_COOP_CHANNEL_ID);
    const channelMessagesMap = await activeCoopChannel.messages.fetch();
    await activeCoopChannel.bulkDelete(channelMessagesMap);

    await activeCoopChannel.send(getActiveCoopsChannelHeaderMessage());

    await interaction.editReply({content: "Active coop channel was successfully set up."});

    await updateActiveCoops(interaction);
}

exports.activateCoop = async (interaction, coopCode) => {
    // coop codes can not be capitalized. Because autocorrect sometimes capitalizes words, we need to decapitalize it
    coopCode = coopCode.toLowerCase();

    // get channel name from the interaction
    const channelName = interaction.member.guild.channels.cache.get(interaction.channelId).name;

    //check for the correct channel name
    if (!channelName.startsWith("group-")) {
        throw new Error("This command should be executed from the respective coop channel. Please do it there.");
    }

    // extract contract id and group number from the channel name
    const contractId = channelName.split("-").slice(2).join("-");
    const groupNumber = channelName.split("-")[1];

    // check if contract exists in active contracts
    let activeContract = await getActiveContractById(contractId);
    if (!activeContract) {
        // check if the contract id actually exists
        const matchingContract = await getMatchingContract(contractId);
        if (!matchingContract) {
            throw new Error(`The provided contract id \`${contractId}\` seems to be wrong.`);
        }

        activeContract = await addActiveContract(contractId);
    }

    // check, if the coop code already exists in the list of active coops
    if (activeContract.activeCoops.map(c => c.coopCode).includes(coopCode)) {
        throw new Error(`Coop code \`${coopCode}\` already exists for contract \`${contractId}\`.`);
    }

    // check, if coop exists
    const coopStatus = await getCoopStatus(contractId, coopCode);
    if (!coopStatus.contributors) {
        throw new Error(`Coop with code \`${coopCode}\` is not an active coop in contract \`${contractId}\`.`);
    }

    // add coop to list of active coops
    await updateActiveContract(activeContract.contractId, activeContract.activeCoops.concat([{coopCode, groupNumber}]));

    await interaction.editReply({
        content: `Coop activated.\nCoop code is: \`${coopCode}\`\n
            https://eicoop.netlify.app/${contractId}/${coopCode}/`
    });

    // call updateActiveCoops to fill active coop message with information
    await updateActiveCoops(interaction);
}

const updateActiveCoops = async (interaction) => {

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
            coopStatus.groupNumber = activeContract.activeCoops[i].groupNumber;
            coopStatusList.push(coopStatus);
        }

        // sort coops by group number
        coopStatusList.sort((a, b) => a.groupNumber - b.groupNumber);

        updatedActiveContracts.push(Object.assign(
            {},
            activeContract.toObject(),
            contractDetails,
            {activeCoops: coopStatusList}
        ));
    }

    // get old messages
    const activeCoopChannel = await interaction.client.channels.cache.get(process.env.ACTIVE_COOP_CHANNEL_ID);
    const channelMessagesMap = await activeCoopChannel.messages.fetch();
    const channelMessages = Array.from(channelMessagesMap.values());
    const oldActiveContractMessages = channelMessages.filter(m => m.embeds && m.embeds.length !== 0);

    // generate new messages
    const activeContractMessages = [];
    for (let activeContract of updatedActiveContracts) {
        activeContractMessages.push(getActiveCoopsMessage(activeContract));
    }

    // edit old messages, as long as they exist
    while (oldActiveContractMessages.length > 0 && activeContractMessages.length > 0) {
        const oldMessage = oldActiveContractMessages.pop();
        const newMessage = activeContractMessages.pop();
        await oldMessage.edit({embeds: [newMessage]});
    }

    // are any new messages left? send them
    if (activeContractMessages.length > 0) {
        for (let m of activeContractMessages) {
            await activeCoopChannel.send({embeds: [m]});
        }
    }

    // are any old messages left? delete them
    if (oldActiveContractMessages.length > 0) {
        for (let m of oldActiveContractMessages) {
            await m.delete();
        }
    }
}

exports.updateActiveCoops = updateActiveCoops;

exports.removeActiveCoop = async (interaction, contractId, coopCode) => {
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
        await interaction.editReply({content: "Coop removed from active coops."});
    } else {
        await removeActiveContract(contractId);
        await interaction.editReply({content: "Coop and contract removed from active coops."});
    }

    // remove coop channel
    await deleteActiveCoopChannel(interaction, contractId, removableCoop.groupNumber);

    // add coop to completed coop channel
    const completedCoopChannel = await interaction.client.channels.cache.get(process.env.COMPLETED_COOP_CHANNEL_ID);
    await completedCoopChannel.send(`${contractId}: \`${coopCode}\``);

    // call updateActiveCoops to remove active coop message
    await updateActiveCoops(interaction);
}

exports.getCoopStatus = async (interaction, contractId, coopCode) => {
    // get contract details
    const contractDetails = await getMatchingContract(contractId);
    if (!contractDetails) {
        throw new Error(`No contract found with id: \`${contractId}\``);
    }

    // get coop status
    let coopStatus = await getCoopStatus(contractId, coopCode);
    if (!coopStatus.contributors) {
        throw new Error(`No coop found with code: \`${coopCode}\``);
    }

    await interaction.editReply({embeds: [getCoopStatusMessage(contractDetails, coopStatus)]});
}
