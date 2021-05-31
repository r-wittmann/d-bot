const {addActiveCoop} = require("../controllers/activeCoop.js");
const {getActiveCoops} = require("../controllers/activeCoop.js");

const {getWrongChannelAskModMessage} = require("../messageGenerators/wrongChannelAskModMessage.js");

module.exports = {
    name: "addactivecoop",
    args: true,
    argsLength: 2,
    usage: "<contract-id> <coop-name>",
    description: "Adds a coop to the list of active coops. This command is only available for the mods in a special channel.",
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

        // call controller to handle the adding
        const responseMessage = await addActiveCoop(message, contractId, coopCode, activeCoops);

        // send response message to the bot channel
        message.channel.send(responseMessage);
    },
};
