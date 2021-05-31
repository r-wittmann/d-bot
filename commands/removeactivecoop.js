const {removeActiveCoop} = require("../controllers/activeCoop.js");
const {getActiveCoops} = require("../controllers/activeCoop.js");

const {getWrongChannelAskModMessage} = require("../messageGenerators/wrongChannelAskModMessage.js");

module.exports = {
    name: "removeactivecoop",
    args: true,
    argsLength: 2,
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

        // call the controller to handle the removing
        const responseMessage = await removeActiveCoop(contractId, coopCode, activeCoops);

        // send response message to the bot channel
        message.channel.send(responseMessage);
    },
};