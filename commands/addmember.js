const {addMemberToDatabase} = require("../controllers/members.js");

module.exports = {
    name: "addmember",
    usage: "<EI-id> <in-game-name> <discord-id>",
    description: "Adds a member to the database. If discord-id is not sent, the bot assumes the author of the message to be the player to be added",
    async execute(message, args) {
        const eiId = args[0];
        const inGameName = args[1];
        const discordId = args[2];

        try {
            await addMemberToDatabase(message, eiId, inGameName, discordId);
        } catch (e) {
            message.channel.send("Something went wrong\n" + e.message);
        }
    },
};
