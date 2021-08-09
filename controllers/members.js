const {log} = require("../services/logService.js");
const {getMemberListMessage} = require("../messageGenerators/membersListMessage.js");
const {getDiscordName} = require("../services/dataAccess/discord.js");
const {addMember, removeMember, getMembers} = require("../services/dataAccess/database.js");

exports.addMember = async (message, eiId, inGameName, discordId) => {
    // check the ei id for a match to the general pattern
    if (!/^(EI)([0-9]{16})/.test(eiId)) {
        await message.channel.send(`The provided EI-id seems to be wrong. It is generally formatted as EI + 16 numbers. You provided \`${eiId}\``);
        await log(message.client, `Add member failed because of a faulty EI-id: \`${eiId}\``);
        return;
    }

    discordId = discordId || message.author.id;
    // to allow mentions as argument for the discord user, some characters have to be removed
    discordId = discordId.replace(/[\\<>@#&!]/g, "");

    try {
        await addMember(eiId, discordId, inGameName);
        await log(message.client, "A member was added to the database", eiId, inGameName, discordId);
        await message.channel.send("Member added");
    } catch (e) {
        throw e;
    }
}

exports.removeMember = async (message, parameter) => {
    // try to infer the type of parameter
    let eiId = "";
    let inGameName = "";
    let discordId = "";
    if (/^(EI)([0-9]{16})/.test(parameter)) {
        eiId = parameter;
    } else if (/^<..([0-9]{18})>/.test(parameter)) {
        // to allow mentions as argument for the discord user, some characters have to be removed
        discordId = parameter.replace(/[\\<>@#&!]/g, "");
    } else if (parameter) {
        inGameName = parameter;
    }

    try {
        const member = await removeMember(eiId, discordId, inGameName);
        if (!member) throw new Error(`User not found. Provided parameter: \`${parameter}\``);

        await log(message.client, "A member was removed from the database", eiId, inGameName, discordId);
        message.channel.send("Member removed");
    } catch (e) {
        throw e;
    }
}

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
        // sort members alphabetically
        membersWithDiscordNames.sort((a,b)=>a.discordName.localeCompare(b.discordName));

        // too many members for one message...
        const chunkedList = [];
        for (let i = 0; i < membersWithDiscordNames.length; i += 10) {
            chunkedList.push(membersWithDiscordNames.slice(i, i + 10));
        }
        await message.channel.send(getMemberListMessage(chunkedList.shift(), 0))

        for (let i = 0; i < chunkedList.length; i++) {
            console.log("send message", i);
            await message.channel.send(getMemberListMessage(chunkedList[i], i + 1))
        }
    } catch (e) {
        throw e;
    }
}
