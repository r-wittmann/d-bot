const {SlashCommandBuilder} = require('@discordjs/builders');
const {assignCoopTeams} = require("../../controllers/contracts.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assigncoopteams")
        .setDescription("Creates fair coop teams and channels for discussions")
        .addStringOption(option =>
            option.setName("contract_id")
                .setDescription("The id of the contract")
                .setRequired(true)),

    async execute(interaction) {
        let contractId = interaction.options.getString("contract_id");
        await interaction.deferReply();

        try {
            await assignCoopTeams(interaction, contractId);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "assigncoopteams",
    usage: "<contract-id>",
    description: "Divides all members into fair coop teams for a provided contract and creates channels for coop discussions.",
    help: "Divides all members into fair coop teams for a provided contract. The assignment is based on EB for the " +
        "first player of each group and on contribution potential for all following players. The coop size of the " +
        "contract is implicitly taken into account. For each group a channel is created for coop discussions.\n" +
        "May take a few moments.",
    async execute(message, args) {
        const contractId = args[0];
        let waitingMessage;

        try {
            // Send a "in progress" message. Ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await assignCoopTeams(message, contractId);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
*/
