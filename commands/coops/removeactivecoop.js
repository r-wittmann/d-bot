const {removeActiveCoop} = require("../../controllers/activeCoops.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "removeactivecoop",
    usage: "<contract-id> <coop-code>",
    description: "Removes an active coop from the list of active coops in the appropriate channel. The discussion channel gets deleted.",
    help: "Removes an active coop from the list of active coops in the appropriate channel. The discussion channel gets deleted.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        try {
            await removeActiveCoop(message, contractId, coopCode);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
