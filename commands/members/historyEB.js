const {SlashCommandBuilder} = require('@discordjs/builders');
const {getMemberEBHistory} = require("../../controllers/members.js");

module.exports = {
    usage: "",
    help: "Returns a list of historic EB based on the contract history.",
    data: new SlashCommandBuilder()
        .setName("earningbonushistory")
        .setDescription("Returns a list of historic EB based on the contract history.")
        .addUserOption(option =>
            option.setName('discord-user')
                .setDescription('The discord user')
                .setRequired(true)),
    async execute(interaction) {
        const discordUser = interaction.options.getUser("discord-user");
        await interaction.deferReply();

        try {
            await getMemberEBHistory(interaction, discordUser);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};
