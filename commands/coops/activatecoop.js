const {SlashCommandBuilder} = require('@discordjs/builders');
const {activateCoop} = require("../../controllers/activeCoops.js");

module.exports = {
    usage: "<contract-id> <coop-code> <group-number>",
    help: "Adds an active coop to the list of active coops in the appropriate channel. Please provide the contract " +
        "id, the coop code and the group number. You find the group number in the coop assignment or the channel " +
        "you were pinged in.",
    data: new SlashCommandBuilder()
        .setName("activatecoop")
        .setDescription("Adds an active coop to the list of active coops in the appropriate channel.")
        .addStringOption(option =>
            option.setName("coop-code")
                .setDescription("The coop code.")
                .setRequired(true)),
    async execute(interaction) {
        let coopCode = interaction.options.getString("coop-code");

        await interaction.deferReply();

        try {
            await activateCoop(interaction, coopCode);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "activatecoop",
    usage: "<contract-id> <coop-code> <group-number>",
    description: "Adds an active coop to the list of active coops in the appropriate channel.",
    help: "Adds an active coop to the list of active coops in the appropriate channel. Please provide the contract " +
        "id, the coop code and the group number. You find the group number in the coop assignment or the channel " +
        "you were pinged in.",
    async execute(message, args) {
        const contractId = args[0];
        const coopCode = args[1];
        const groupNumber = args[2];

        try {
            await activateCoop(message, contractId, coopCode, groupNumber);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
