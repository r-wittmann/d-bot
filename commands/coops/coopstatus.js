const {getCoopStatus} = require("../../controllers/activeCoops.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "coopstatus",
    usage: "<contract-id> <coop-code>",
    description: "Returns the current coop status.",
    help: "Returns the current coop status.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        try {
            await getCoopStatus(message, contractId, coopCode);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
