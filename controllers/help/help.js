const {log} = require("../../services/logService.js");

exports.help = async (message, args, commands) => {

    if (args.length === 0) {
        let response = "Here is a list of all commands and how they can be used\n\n>>> ";
        for (const command of commands) {
            response += `\`${process.env.PREFIX}${command[1].name} ${command[1].usage}\`\n`;
            response += `\t${command[1].description}\n\n`;
        }
        message.channel.send(response);
    } else {
        const commandName = args[0];
        const command = commands.get(commandName);
        let response = `Help for the \`${commandName}\` command:\n\n>>> `;
        response += `\`${process.env.PREFIX}${command.name} ${command.usage}\`\n`;
        response += command.help;
        message.channel.send(response);
    }
    await log(message.client, "command `help` completed");
}
