const {assignCoopTeams} = require("../../controllers/contracts.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "assigncoopteams",
    usage: "<contract-id>",
    description: "Divides all members into fair coop teams for a provided contract.",
    help: "Divides all members into fair coop teams for a provided contract. The assignment is based on EB for the " +
        "first player of each group and on contribution potential for all following players. The coop size of the " +
        "contract is implicitly taken into account.\n" +
        "May take a few moments.",
    async execute(message, args) {
        const contractId = args[0];
        let waitingMessage;

        try {
            // Send a "in progress" message. Ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await assignCoopTeams(message, contractId);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
