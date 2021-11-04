const {SlashCommandBuilder} = require('@discordjs/builders');
const {removeActiveCoop} = require("../../controllers/activeCoops.js");

module.exports = {
    usage: "<contract-id> <coop-code>",
    help: "Removes an active coop from the list of active coops in the appropriate channel. The discussion channel gets deleted.",
    data: new SlashCommandBuilder()
        .setName("removeactivecoop")
        .setDescription("Removes an active coop from the list of active coops and deletes the discussion channel.")
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
            await removeActiveCoop(interaction, contractId, coopCode);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "removeactivecoop",
    usage: "<contract-id> <coop-code>",
    description: "Removes an active coop from the list of active coops in the appropriate channel. The discussion channel gets deleted.",
    help: "Removes an active coop from the list of active coops in the appropriate channel. The discussion channel gets deleted.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];

        try {
            await removeActiveCoop(message, contractId, coopCode);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
