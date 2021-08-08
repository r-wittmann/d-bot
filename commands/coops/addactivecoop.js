const {log} = require("../../services/logService.js");

module.exports = {
    name: "addactivecoop",
    usage: "",
    description: "This is a deprecated command.",
    help: "This is a deprecated command.",
    async execute(message) {
        await message.channel.send("This is a deprecated command. Please use `$activatecoop`");
        await message.channel.send("$help activatecoop");
        await log(message.client, "Someone tried to call `$addactivecoop`.")
    },
};
