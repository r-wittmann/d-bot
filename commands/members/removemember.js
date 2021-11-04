const {SlashCommandBuilder} = require('@discordjs/builders');
const {removeMember} = require("../../controllers/members.js");

module.exports = {
    usage: "<EI-id> <in-game-name> <@discord-user>",
    help: "Removes a member from the database of players. Please provide the EI-id (EI + 16 numbers), the in game " +
        "name or mention the user (@UserName). Only ONE of these parameters has to be provided.",
    data: new SlashCommandBuilder()
        .setName("removemember")
        .setDescription("Removes a member from the database. Only ONE of these parameters has to be provided.")
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
            await removeMember(interaction, eiId, inGameName, discordId);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "removemember",
    usage: "<EI-id> <in-game-name> <@discord-user>",
    description: "Removes a member from the database. Only ONE of these parameters have to be provided.",
    help: "Removes a member from the database of players. Please provide the EI-id (EI + 16 numbers), the in game name or mention the new user (@UserName). Instead of the user mention, you can also provide the discord id (18 numbers).\n" +
        "Only ONE of these parameters have to be provided.",
    async execute(message, args) {
        const parameter = args[0];

        try {

            await removeMember(message, parameter);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
