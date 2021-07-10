const {addMember, getMembers, removeMember} = require("../services/dataAccess/database.js");
const {getEiIdMissMatchMessage} = require("../messageGenerators/eiIdMissMatchMessage.js");
const {getMemberListMessage} = require("../messageGenerators/memberListMessage.js");

exports.addMemberToDatabase = async (message, eiId, inGameName, discordId) => {
    // check the ei id for a match to the general pattern
    if (!/^(EI)([0-9]{16})/.test(eiId)) {
        message.channel.send(getEiIdMissMatchMessage(eiId));
        return;
    }

    try {
        await addMember(eiId, discordId || message.author.id, inGameName);
        message.channel.send("Member added");
    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }
}

exports.removeMemberFromTheDatabase = async (message, parameter) => {
    // try to infer the type of parameter
    let eiId = "";
    let inGameName = "";
    let discordId = "";
    if (/^(EI)([0-9]{16})/.test(parameter)) {
        eiId = parameter;
    } else if (/^([0-9]{18})/.test(parameter)) {
        discordId = parameter;
    } else if (parameter) {
        inGameName = parameter;
    }

    try {
        await removeMember(eiId, discordId, inGameName);
        message.channel.send("Member removed");
    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }
}

exports.getMembersFromDatabase = async (message) => {
    try {
        const members = await getMembers();

        // add discord user name or display name
        const membersWithDiscordNames = await getDiscordDisplayNames(message, members);

        await message.channel.send(getMemberListMessage(membersWithDiscordNames));
    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }
}

const getDiscordDisplayNames = async (message, members) => {
    let updatedMembers = [];

    // fetch and add the discord user name
    for (const member of members) {
        let discordUser;
        try {
            // try to get the member of the server
            discordUser = await message.guild.members.fetch(member.discordId);
        } catch (e) {
            // if the member is not on the server, get the user
            discordUser = await message.client.users.fetch(member.discordId);
        }

        // some users have information in brackets in their nickname. We are going to remove that
        let discordName = discordUser.displayName || discordUser.username;
        discordName = discordName.split(" (")[0];

        const updatedMember = Object.assign({}, member.toObject(), {discordName});
        updatedMembers.push(updatedMember);
    }

    return updatedMembers;
}
