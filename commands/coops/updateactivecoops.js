const {updateActiveCoops} = require("../../controllers/activeCoops.js");
const {log} = require("../../services/logService.js");

module.exports = {
    name: "updateactivecoops",
    usage: "",
    description: "Updates the active coops in the active coop channel.",
    help: "Updates the active coops in the active coop channel. This command is called automatically after an active " +
        "coop was added or removed. Additionally, this command is automatically performed once a minute.",
    async execute(message) {

        try {
            await updateActiveCoops(message);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
