const {checkParticipation} = require("../../controllers/contracts.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "checkparticipation",
    usage: "<contract-id>",
    description: "Checks the participation status of all members in the provided contract. May take a few moments.",
    help: "Based on the contract id, the bot checks the participation status of all members. It detects players that " +
        "have already completed the contract, players that are currently active in a coop and players, that have not " +
        "yet joined a coop.\n" +
        "May take a few moments.",
    async execute(message, args) {
        const contractId = args[0];
        let waitingMessage;

        try {
            // Send a "in progress" message. Ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await checkParticipation(message, contractId);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
