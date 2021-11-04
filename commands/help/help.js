const {SlashCommandBuilder} = require('@discordjs/builders');

const {help} = require("../../controllers/help.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Returns a list of all commands including their descriptions."),
    async execute(interaction, commands) {
        try {
            await help(interaction, commands);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "help",
    usage: "<command>",
    description: "Returns a list of all commands including their descriptions and usage. " +
        "The <command> parameter is optional.",
    help: "Returns a list of all commands including their descriptions and usage.\nThe " +
        "<command> parameter is optional. Passing a <command> returns specific instructions " +
        "for that command",
    async execute(message, args, commands) {
        try {
            await help(message, args, commands)
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
