const {getChannelNameByContractNameAndCoopCode} = require("../services/utils.js");
const {getActiveCoops} = require("./activeCoop.js");

exports.createActiveCoopChannel = async (message, contractId, coopCode) => {
    const updatedActiveCoops = await getActiveCoops(message.client);
    const contractName = updatedActiveCoops.find(coop => coop.contractId === contractId).contractName;
    const createdChannel = await message.guild.channels.create(`${contractName} - ${coopCode}`, {
        type: "text", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            }
        ],
        parent: process.env.COOP_CATEGORY_ID,
        position: 2
    })

    await createdChannel.send(`$coopstatus ${contractId} ${coopCode}`);

    message.channel.send("Channel created");
}

exports.moveActiveCoopChannelToArchive = async (message, contractId, coopCode) => {
    const activeCoops = await getActiveCoops(message.client);
    console.log(activeCoops);
    const contractName = activeCoops.find(coop => coop.contractId === contractId).contractName;
    console.log(contractName);

    // get all channels in coop category
    const activeChannels = await message.client.channels.cache;
    console.log("active channels collected");
    const channelToMove = activeChannels.find(channel => channel.name === getChannelNameByContractNameAndCoopCode(contractName, coopCode));
    console.log(channelToMove);
    await channelToMove.edit({parentID: process.env.ARCHIVE_CATEGORY_ID});
}

