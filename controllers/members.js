const {addMember, removeMember} = require("../services/database.js");
const {getEiIdMissMatchMessage} = require("../messageGenerators/eiIdMissMatchMessage.js");

exports.addMemberToDatabase = async (message, eiId) => {
    // check the ei id for a match to the general pattern
    if (!/^(EI)([0-9]{16})/.test(eiId)) {
        message.channel.send(getEiIdMissMatchMessage(eiId));
        return;
    }

    try {
        await addMember(eiId, message.author.id);
        message.channel.send("Member added");
    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }
}

exports.removeMemberFromTheDatabase = async (message, eiId) => {
    // check the ei id for a match to the general pattern
    if (eiId && !/^(EI)([0-9]{16})/.test(eiId)) {
        message.channel.send(getEiIdMissMatchMessage(eiId));
        return;
    }

    try {
        await removeMember(eiId, message.author.id);
        message.channel.send("Member removed");
    } catch (e) {
        message.channel.send("Something went wrong\n" + e.message);
    }
}
