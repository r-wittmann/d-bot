const {removeMemberFromTheDatabase} = require("../controllers/members.js");

module.exports = {
    name: "removemember",
    usage: "<EI-id> (optional)",
    description: "Removes a member from the database",
    async execute(message, args) {
        const eiId = args[0];

        await removeMemberFromTheDatabase(message, eiId);
    },
};
