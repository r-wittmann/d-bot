const {moveActiveCoopChannelToArchive} = require("../controllers/coopChannels.js");
const {removeActiveCoop} = require("../controllers/activeCoop.js");
const {getActiveCoops} = require("../controllers/activeCoop.js");

const {getWrongChannelAskModMessage} = require("../messageGenerators/wrongChannelAskModMessage.js");

module.exports = {
    name: "removeactivecoop",
    usage: "<contract-id> <coop-name>",
    description: "Removes a coop to the list of active coops. This command is only available for the mods in a special channel.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        // this command should only be available for the mods in a specific channel
        // this is checked here, before anything else is done
        if (message.channel.id !== process.env.BOT_CHANNEL_ID) {
            message.channel.send(getWrongChannelAskModMessage());
        }

        // extract active coops from the "active coops" channel
        const activeCoops = await getActiveCoops(message.client);

        // try to move the channel to the archive
        try {
            await moveActiveCoopChannelToArchive(message, contractId, coopCode);
            message.channel.send("Channel moved To Archive");
        } catch (e) {
            message.channel.send("Something went wrong...");
            return;
        }

        // call the controller to handle the removing from the active-coop channel
        await removeActiveCoop(message, contractId, coopCode, activeCoops);
    },
};
