const {log} = require("../../services/logService.js");

module.exports = {
    name: "help",
    usage: "",
    description: "Returns a list of all commands including their descriptions and usage",
    async execute(message, commands) {
        let response = "Here is a list of all commands and how they can be used\n\n>>> ";
        for (const command of commands) {
            response += `\`${process.env.PREFIX}${command[1].name} ${command[1].usage}\`\n`;
            response += `\t${command[1].description}\n\n`;
        }
        message.channel.send(response);

        await log(message.client, "command `help` completed");
    },
};