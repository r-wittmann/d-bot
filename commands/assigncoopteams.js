const {assignCoopTeams} = require("../controllers/assignCoopTeams.js");

module.exports = {
    name: "assigncoopteams",
    usage: "<contract-id>",
    description: "Divides all members into fair coop teams for a given contract",
    async execute(message, args) {
        const contractId = args[0];
        let waitingMessage;

        try {
            // Send a "in progress" message. Ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await assignCoopTeams(message, contractId);
        } catch (e) {
            message.channel.send("Something went wrong\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
