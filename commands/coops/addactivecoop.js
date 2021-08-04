const {addActiveCoop} = require("../../controllers/activeCoops.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "addactivecoop",
    usage: "<contract-id> <coop-code>",
    description: "Adds an active coop to the list of active coops in the appropriate channel. Additionally, a new channel for coop discussion is created.",
    help: "Adds an active coop to the list of active coops in the appropriate channel. Additionally, a new channel for coop discussions is created. Channel name is based on coop code and contract id.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        try {
            await addActiveCoop(message, contractId, coopCode);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
