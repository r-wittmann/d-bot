const {removeMemberFromTheDatabase} = require("../controllers/members.js");

module.exports = {
    name: "removemember",
    usage: "<EI-id> <in-game-name> <discord-id>",
    description: "Removes a member from the database. Only one of those three parameters has to be sent.",
    async execute(message, args) {
        const parameter = args[0];
        if (!parameter) {
            message.channel.send(`Please provide one of the following parameters: ${this.usage}`);
            return;
        }

        await removeMemberFromTheDatabase(message, parameter);
    },
};
