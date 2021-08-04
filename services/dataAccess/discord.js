exports.getDiscordName = async (message, discordId) => {
    let discordUser;
    try {
        // try to get the member of the server
        discordUser = await message.guild.members.fetch(discordId);
    } catch (e) {
        // if the member is not on the server, get the user
        discordUser = await message.client.users.fetch(discordId);
    }

    // some users have information in brackets in their nickname. We are going to remove that
    let discordName = discordUser.displayName || discordUser.username;
    return discordName.split(" (")[0];
}

exports.createActiveCoopChannel = async (message, contractId, coopCode) => {
    try {
        const createdChannel = await message.guild.channels.create(
            `${coopCode}-${contractId}`, {
                type: "text",
                parent: process.env.COOP_CATEGORY_ID,
                position: 100
            }
        );

        await createdChannel.send(`$coopstatus ${contractId} ${coopCode}`);
    } catch
        (e) {
        throw e;
    }
}

exports.deleteActiveCoopChannel = async (message, contractId, coopCode) => {

    try {
        // get all channels in coop category
        const activeChannels = await message.client.channels.cache;
        const channelToDelete = activeChannels.find(channel =>
            channel.name === `${coopCode}-${contractId}`
            && channel.parent.id === process.env.COOP_CATEGORY_ID
        );
        await channelToDelete.delete();
    } catch (e) {
        throw e;
    }
}
