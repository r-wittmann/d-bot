const {addMemberToDatabase} = require("../controllers/members.js");

module.exports = {
    name: "addmember",
    usage: "<EI-id> <inGameName>",
    description: "Adds a member to the database",
    async execute(message, args) {
        const eiId = args[0];
        const inGameName = args[1];

        await addMemberToDatabase(message, eiId, inGameName);
    },
};
