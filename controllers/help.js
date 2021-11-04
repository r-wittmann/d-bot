const {getHelpMessage} = require("../messageGenerators/helpMessage.js");

exports.help = async (interaction, commands) => {
    await interaction.editReply({embeds: [getHelpMessage(commands)]});
}
