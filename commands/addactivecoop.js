const {getActiveCoops} = require("../controllers/activeCoop.js");
const {getMatchingContract} = require("../controllers/matchingContract.js");

const {getActiveCoopsMessage} = require("../messageGenerators/activeCoopsMessage.js");
const {getContractNotFoundMessage} = require("../messageGenerators/contractNotFoundMessage.js");
const {getCoopExistsInActiveCoopsMessage} = require("../messageGenerators/coopExistsInActiveCoopsMessage.js");
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
        const activeCoops = await getActiveCoops(message);

        // check, if the sent contract already exists in our list
        const existingContractMessage = activeCoops.find(coop => coop.contractId === contractId);
        if (existingContractMessage) {
            // if coop already exists, send message about it and exit command
            if (existingContractMessage.coopCodes.includes(coopCode)) {
                message.channel.send(getCoopExistsInActiveCoopsMessage(contractId, coopCode));
                return;
            }
            // add new coop to coopCodes
            const coopCodes = existingContractMessage.coopCodes.concat([coopCode]);
            // update existing message by creating new Content and exit command
            await existingContractMessage.m.edit({
                embed:
                    getActiveCoopsMessage(
                        existingContractMessage.contractName,
                        existingContractMessage.contractId,
                        coopCodes
                    )
            });

            message.channel.send("Coop added");
            return;
        }

        // get the contract information
        const contract = await getMatchingContract(contractId);
        // if no contract is found, return a message to the channel and exit the command
        if (!contract) {
            message.channel.send(getContractNotFoundMessage(contractId));
            return;
        }
        // send coop information to the channel
        message.client.channels.cache.get(process.env.ACTIVE_COOP_CHANNEL_ID)
            .send({embed: getActiveCoopsMessage(contract.name, contractId, [coopCode])});
        message.channel.send("Coop Added");
    },
};
