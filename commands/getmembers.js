const {getMembersFromDatabase} = require("../controllers/members.js");

module.exports = {
    name: "getmembers",
    usage: "",
    description: "Gets all members from the database",
    async execute(message, args) {
        await getMembersFromDatabase(message);
    },
};
