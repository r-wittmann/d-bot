const {SlashCommandBuilder} = require('@discordjs/builders');
const {setupActiveCoopChannel} = require("../../controllers/activeCoops.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupactivecoopchannel")
        .setDescription("Creates messages necessary for the active coops channel"),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            await setupActiveCoopChannel(interaction);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};
