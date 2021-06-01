const {getChannelNameByContractNameAndCoopCode} = require("../services/utils.js");
const {getActiveCoops} = require("./activeCoop.js");

exports.createActiveCoopChannel = async (message, contractId, coopCode) => {
    const updatedActiveCoops = await getActiveCoops(message.client);
    const contractName = updatedActiveCoops.find(coop => coop.contractId === contractId).contractName;
    const createdChannel = await message.guild.channels.create(getChannelNameByContractNameAndCoopCode(contractName, coopCode), {
        type: "text",
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            }
        ],
        parent: process.env.COOP_CATEGORY_ID
    })

    await createdChannel.send(`$coopstatus ${contractId} ${coopCode}`);

    message.channel.send("Channel created");
}

exports.moveActiveCoopChannelToArchive = async (message, contractId, coopCode) => {
    const activeCoops = await getActiveCoops(message.client);
    const contractName = activeCoops.find(coop => coop.contractId === contractId).contractName;

    // get all channels in coop category
    const activeChannels = await message.client.channels.cache;
    const channelToMove = activeChannels.find(channel => channel.name === getChannelNameByContractNameAndCoopCode(contractName, coopCode));
    await channelToMove.edit({parentID: process.env.ARCHIVE_CATEGORY_ID});
}

