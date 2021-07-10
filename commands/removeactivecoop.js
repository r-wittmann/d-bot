const {deleteActiveCoopChannel} = require("../controllers/coopChannels.js");
const {removeActiveCoop} = require("../controllers/activeCoop.js");
const {getActiveCoops} = require("../controllers/activeCoop.js");

module.exports = {
    name: "removeactivecoop",
    usage: "<contract-id> <coop-name>",
    description: "Removes a coop to the list of active coops.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        // extract active coops from the "active coops" channel
        const activeCoops = await getActiveCoops(message.client);

        // try to move the channel to the archive
        try {
            await deleteActiveCoopChannel(message, contractId, coopCode);
            message.channel.send("Channel moved To Archive");
        } catch (e) {
            message.channel.send("Something went wrong...");
            return;
        }

        // call the controller to handle the removing from the active-coop channel
        await removeActiveCoop(message, contractId, coopCode, activeCoops);
    },
};
