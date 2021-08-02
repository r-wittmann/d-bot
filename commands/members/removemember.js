const {removeMember} = require("../../controllers/members/members.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "removemember",
    usage: "<EI-id> <in-game-name> <@discord-user>",
    description: "Removes a member from the database. Only ONE of these parameters have to be provided.",
    help: "Removes a member from the database of players. Please provide the EI-id (EI + 16 numbers), the in game name or mention the new user (@UserName). Instead of the user mention, you can also provide the discord id (18 numbers).\n" +
        "Only ONE of these parameters have to be provided.",
    async execute(message, args) {
        const parameter = args[0];

        try {

            await removeMember(message, parameter);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
