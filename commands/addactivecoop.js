const {addActiveCoop} = require("../controllers/activeCoop.js");
const {createActiveCoopChannel} = require("../controllers/coopChannels.js");
const {getActiveCoops} = require("../controllers/activeCoop.js");


module.exports = {
    name: "addactivecoop",
    usage: "<contract-id> <coop-name>",
    description: "Adds a coop to the list of active coops.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        // extract active coops from the "active coops" channel
        const activeCoops = await getActiveCoops(message.client);

        // call controller to handle the adding
        const success = await addActiveCoop(message, contractId, coopCode, activeCoops);

        // if coop was added successfully, create a channel for the coop
        if (success) {
            await createActiveCoopChannel(message, contractId, coopCode);
        }
    },
};
