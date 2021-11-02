exports.help = async (interaction, commands) => {
    let response = "Here is a list of all commands and what they do\n\n>>> ";
    commands.forEach((value) => {
        console.log(value)
        response += `\`/${value.data.name}\`\n`;
        response += `\t${value.data.description}\n\n`;
    })
    await interaction.reply({content: response});
}
