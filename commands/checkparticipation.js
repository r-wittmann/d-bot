const {checkParticipation} = require("../controllers/participation.js");
const {getMembers} = require("../controllers/participation.js");

module.exports = {
    name: "checkparticipation",
    usage: "<contract-id>",
    description: "Checks the participation status of all members in the contract",
    async execute(message, args) {
        const contractId = args[0];
        // ignore warning below. That's not true
        const waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

        // get all members
        const members = await getMembers();

        // check participation
        await checkParticipation(message, members, contractId);

        await waitingMessage.delete();
    },
};
