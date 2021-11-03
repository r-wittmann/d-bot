const {SlashCommandBuilder} = require('@discordjs/builders');
const {getCoopStatus} = require("../../controllers/activeCoops.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coopstatus")
        .setDescription("Returns the current coop status.")
        .addStringOption(option =>
            option.setName("contract-id")
                .setDescription("The id of the contract.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("coop-code")
                .setDescription("The coop code.")
                .setRequired(true)),

    async execute(interaction) {
        let contractId = interaction.options.getString("contract-id");
        let coopCode = interaction.options.getString("coop-code");
        await interaction.deferReply();

        try {
            await getCoopStatus(interaction, contractId, coopCode);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "coopstatus",
    usage: "<contract-id> <coop-code>",
    description: "Returns the current coop status.",
    help: "Returns the current coop status.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        try {
            await getCoopStatus(message, contractId, coopCode);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
