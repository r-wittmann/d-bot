const {getMemberListMessage} = require("../messageGenerators/membersListMessage.js");
const {getDiscordName} = require("../services/dataAccess/discord.js");
const {addMember, removeMember, getMembers} = require("../services/dataAccess/database.js");
const {getPlayerByEiId} = require("../services/dataAccess/auxbrainApi.js");
const {convertMilliseconds} = require("../services/utils.js");
const {getMembersActivityMessage} = require("../messageGenerators/membersActivityMessage.js");

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

exports.checkMembersActivity = async (interaction) => {
    // get all members
    let updatedMembers = [];
    try {
        const members = await getMembers();

        // get player info from auxbrain API
        for (let member of members) {
            const player = await getPlayerByEiId(member.eiId);
            member = Object.assign({}, member.toObject(), {backup: player.backup});
            updatedMembers.push(member);
        }
    } catch (e) {
        throw e;
    }

    // calculate time since last activity
    const membersWithActivity = []
    updatedMembers.forEach(member => {
        const lastActivity = new Date(member.backup.approxTime * 1000);
        const now = new Date();
        const timeSinceLastActivity = convertMilliseconds(now - lastActivity);
        membersWithActivity.push(Object.assign({}, member, {timeSinceLastActivity}));
    })

    const message = getMembersActivityMessage(membersWithActivity);
    console.log(message);

    await interaction.editReply({embeds: [getMembersActivityMessage(membersWithActivity)]})
}
