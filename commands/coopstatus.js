const {coopStatusMessage} = require("../services/messageGenerators/coopStatusMessage.js");
const {getMatchingContract, requestCoopStatus} = require("../services/api.js");

module.exports = {
    name: "coopstatus",
    args: true,
    argsLength: 2,
    usage: "<contract-id> <coop-name>",
    description: "Returns the current coop status",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        // find the matching contract from mk2's list
        const matchingContract = await getMatchingContract(contractId);
        if (!matchingContract) {
            message.channel.send(`The contract ID seems to be wrong. No contract found with id ${contractId}`);
            return;
        }

        // get coop status from auxbrain API
        const coopStatusObject = await requestCoopStatus(contractId, coopCode);

        message.channel.send({embed: coopStatusMessage(coopStatusObject, matchingContract)});
    },
};
