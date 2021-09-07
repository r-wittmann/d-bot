const {log} = require("../../services/logService.js");
const {generateRanking} = require("../../controllers/rank.js");

module.exports = {
    name: "rank",
    usage: "<type>",
    description: "Returns the current ranking of members on various options. <type> can be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total), 'D' (drones) or 'LEG' (Legendaries).",
    help: "Returns the current ranking of members on various options. <type> can be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total), 'D' (drones) or 'LEG' (Legendaries).",
    async execute(message, args) {
        const type = args[0];
        let waitingMessage;

        try {
            // ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await generateRanking(message, type);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
