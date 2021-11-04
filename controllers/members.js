const {getMemberListMessage} = require("../messageGenerators/membersListMessage.js");
const {getDiscordName} = require("../services/dataAccess/discord.js");
const {addMember, removeMember, getMembers} = require("../services/dataAccess/database.js");

exports.addMember = async (interaction, eiId, inGameName, discordUser) => {
    // check the ei id for a match to the general pattern
    if (!/^(EI)([0-9]{16})/.test(eiId)) {
        throw new Error(`The provided EI-id seems to be wrong. It is generally formatted as EI + 16 numbers. You provided \`${eiId}\``);
    }

    try {
        await addMember(eiId, discordUser.id, inGameName);
        await interaction.editReply({content: "Member added successfully"});
    } catch (e) {
        throw e;
    }
}

exports.removeMember = async (interaction, eiId, inGameName, discordId) => {
    if (eiId === "" && inGameName === "" && discordId === "") {
        throw new Error("At least one parameter is required for this command");
    }

    try {
        const member = await removeMember(eiId, discordId, inGameName);
        if (!member) throw new Error(`User not found. Provided parameters: egg-inc-id\`${eiId}\`, in-game-name\`${inGameName}\`, discord-user\`${discordId}\`,`);

        await interaction.editReply({content: "Member removed successfully"});
    } catch (e) {
        throw e;
    }
}

exports.getMembers = async (interaction) => {
    try {
        const members = await getMembers();

        // add discord user name or display name
        const membersWithDiscordNames = [];
        for (let member of members) {
            const discordName = await getDiscordName(interaction, member.discordId);
            const updatedMember = Object.assign({}, member.toObject(), {discordName});
            membersWithDiscordNames.push(updatedMember);
        }
        // sort members alphabetically
        membersWithDiscordNames.sort((a, b) => a.discordName.localeCompare(b.discordName));

        // too many members for one message...
        const chunkedList = [];
        for (let i = 0; i < membersWithDiscordNames.length; i += 10) {
            chunkedList.push(membersWithDiscordNames.slice(i, i + 10));
        }

        await interaction.channel.send(getMemberListMessage(chunkedList.shift(), 0))

        for (let i = 0; i < chunkedList.length; i++) {
            await interaction.channel.send(getMemberListMessage(chunkedList[i], i + 1))
        }

        await interaction.editReply({content: "Member List:"});
    } catch (e) {
        throw e;
    }
}
