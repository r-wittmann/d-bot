const {getMatchingContract} = require("../controllers/matchingContract.js");
const {getCoopStatus} = require("../controllers/coopStatus.js");

const {getCoopNotFoundMessage} = require("../messageGenerators/coopNotFoundMessage.js");
const {getContractNotFoundMessage} = require("../messageGenerators/contractNotFoundMessage.js");
const {getCoopStatusMessage} = require("../messageGenerators/coopStatusMessage.js");

module.exports = {
    name: "coopstatus",
    args: true,
    argsLength: 2,
    usage: "<contract-id> <coop-name>",
    description: "Returns the current coop status",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        // call matching contract controller to get the contract information
        const contract = await getMatchingContract(contractId);
        // if no contract is found, return a message to the channel and exit the command
        if (!contract) {
            message.channel.send(getContractNotFoundMessage(contractId));
            return;
        }

        // get coop status
        const coopStatus = await getCoopStatus(contractId, coopCode);
        // if the coop isn't found, return a message to the channel and exit the command
        if (!coopStatus) {
            message.channel.send(getCoopNotFoundMessage(contractId, coopCode));
            return;
        }

        await message.channel.send({embed: getCoopStatusMessage(coopStatus, contract)});
    },
};
