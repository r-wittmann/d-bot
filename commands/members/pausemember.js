const {SlashCommandBuilder} = require('@discordjs/builders');
const {pauseMember} = require("../../controllers/members.js");

module.exports = {
    usage: "<EI-id> <in-game-name> <@discord-user>",
    help: "Pauses or unpauses the active participation of a member. Please provide the EI-id (EI + 16 numbers), the in game " +
        "name or mention the user (@UserName). Only ONE of these parameters has to be provided.",
    data: new SlashCommandBuilder()
        .setName("pausemember")
        .setDescription("(Un)pauses the active participation of a member. Only ONE of these parameters has to be provided.")
        .addStringOption(option =>
            option.setName("egg-inc-id")
                .setDescription("The members Egg Inc id (EI...)")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("in-game-name")
                .setDescription("The members Egg Inc name")
                .setRequired(false))
        .addUserOption(option =>
            option.setName('discord-user')
                .setDescription('The discord user')
                .setRequired(false)),
    async execute(interaction) {
        const eiId = interaction.options.getString("egg-inc-id") || "";
        const inGameName = interaction.options.getString("in-game-name") || "";
        const discordId = interaction.options.getUser("discord-user")?.id || "";

        await interaction.deferReply();

        try {
            await pauseMember(interaction, eiId, inGameName, discordId);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};
