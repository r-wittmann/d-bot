const {getMembersFromDatabase} = require("../controllers/members.js");

module.exports = {
    name: "getmembers",
    usage: "",
    description: "Gets all members from the database, adds both discord nickname and in game name",
    async execute(message, args) {
        // ignore warning below. That's not true
        const waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");
        await getMembersFromDatabase(message);
        await waitingMessage.delete();
    },
};
