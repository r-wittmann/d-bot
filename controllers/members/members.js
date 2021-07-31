const {log} = require("../../services/logService.js");
const {getMemberListMessage} = require("../../messageGenerators/membersListMessage.js");
const {getDiscordName} = require("../../services/dataAccess/discord.js");
const {getMembers} = require("../../services/dataAccess/database.js");

exports.getMembers = async (message) => {
    try {
        const members = await getMembers();

        // add discord user name or display name
        const membersWithDiscordNames = [];
        for (let member of members) {
            const discordName = await getDiscordName(message, member.discordId);
            const updatedMember = Object.assign({}, member.toObject(), {discordName});
            membersWithDiscordNames.push(updatedMember);
        }

        await message.channel.send(getMemberListMessage(membersWithDiscordNames));
        await log(message.client, "Members list generated successfully");
    } catch (e) {
        throw e;
    }
}
