const {getChannelNameByContractNameAndCoopCode} = require("../services/utils.js");
const {getActiveCoops} = require("./activeCoop.js");

exports.createActiveCoopChannel = async (message, contractId, coopCode) => {
    const updatedActiveCoops = await getActiveCoops(message.client);
    const contractName = updatedActiveCoops.find(coop => coop.contractId === contractId).contractName;
    const createdChannel = await message.guild.channels.create(getChannelNameByContractNameAndCoopCode(contractName, coopCode), {
        type: "text",
        parent: process.env.COOP_CATEGORY_ID,
        position: 100
    })

    await createdChannel.send(`$coopstatus ${contractId} ${coopCode}`);

    message.channel.send("Channel created");
}

exports.deleteActiveCoopChannel = async (message, contractId, coopCode) => {
    const activeCoops = await getActiveCoops(message.client);
    const contractName = activeCoops.find(coop => coop.contractId === contractId).contractName;

    // get all channels in coop category
    const activeChannels = await message.client.channels.cache;
    const channelToDelete = activeChannels.find(channel =>
        channel.name === getChannelNameByContractNameAndCoopCode(contractName, coopCode)
        && channel.parent.id === process.env.COOP_CATEGORY_ID
    );
    await channelToDelete.delete();
}

