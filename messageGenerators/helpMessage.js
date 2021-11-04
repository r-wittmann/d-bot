const getCommandFields = (commands) => {
    return commands.map(command => ({
        name: `\`/${command.data.name} ${command.usage || ""}\``,
        value: command.help || command.data.description,
        inline: false
    }))
}

exports.getHelpMessage = (commands) => {
    return {
        color: 0x0099ff,
        title: "Available Bot Commands",
        description: "Here is a list of all bot commands and what they do.",
        fields: getCommandFields(commands),
    };
}
