exports.getDiscordName = async (interaction, discordId) => {
    let discordUser;
    try {
        // try to get the member of the server
        discordUser = await interaction.guild.members.fetch(discordId);
    } catch (e) {
        // if the member is not on the server, get the user
        discordUser = await interaction.client.users.fetch(discordId);
    }

    // some users have information in brackets in their nickname. We are going to remove that
    let discordName = discordUser.displayName || discordUser.username;
    return discordName.split(" (")[0];
}

exports.deleteActiveCoopChannel = async (interaction, contractId, groupNumber) => {

    try {
        // get all channels in coop category
        const activeChannels = await interaction.client.channels.cache;
        const channelToDelete = activeChannels.find(channel =>
            channel.name === `group-${groupNumber}-${contractId}`
            && channel.parent.id === process.env.COOP_CATEGORY_ID
        );
        await channelToDelete.delete();
    } catch (e) {
        throw e;
    }
}
