const {SlashCommandBuilder} = require('@discordjs/builders');
const {addMember} = require("../../controllers/members.js");

module.exports = {
    usage: "<EI-id> <in-game-name> <@discord-user>",
    help: "Adds a new member to the database of players. Please provide the EI-id (EI + 16 numbers), the in game " +
        "name and mention the new user (@UserName).\nAll parameters have to be provided.",
    data: new SlashCommandBuilder()
        .setName("addmember")
        .setDescription("Adds a new member to the database.")
        .addStringOption(option =>
            option.setName("egg-inc-id")
                .setDescription("The members Egg Inc id (EI...)")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("in-game-name")
                .setDescription("The members Egg Inc name")
                .setRequired(true))
        .addUserOption(option =>
            option.setName('discord-user')
                .setDescription('The discord user')
                .setRequired(true)),
    async execute(interaction) {
        const eiId = interaction.options.getString("egg-inc-id");
        const inGameName = interaction.options.getString("in-game-name");
        const discordUser = interaction.options.getUser("discord-user");
        await interaction.deferReply();

        try {
            await addMember(interaction, eiId, inGameName, discordUser);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "addmember",
    usage: "<EI-id> <in-game-name> <@discord-user>",
    description: "Adds a new member to the database. If the discord id is not provided, the bot assumes the author of the message to be the new player.",
    help: "Adds a new member to the database of players. Please provide the EI-id (EI + 16 numbers), the in game name and mention the new user (@UserName). Instead of the user mention, you can also provide the discord id (18 numbers).\n" +
        "If the discord user or id is not provided, the bot assumes the author of the message to be the new player.",
    async execute(message, args) {
        const eiId = args[0];
        const inGameName = args[1];
        const discordId = args[2];

        try {

            await addMember(message, eiId, inGameName, discordId);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
