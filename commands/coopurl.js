module.exports = {
    name: "coopurl",
    args: true,
    argsLength: 2,
    usage: "<contract-id> <coop-name>",
    description: "Returns the coop tracking url from mk2",
    execute(message, args) {
        message.delete();

        const contractId = args[0];
        const coopCode = args[1];

        let response = `Here is the link to track the progress of coop **${coopCode}** in contract **${contractId}**:\n`
        response += `https://eicoop.netlify.app/${contractId}/${coopCode}`;

        message.channel.send(response);
    },
};