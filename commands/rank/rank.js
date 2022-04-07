const {SlashCommandBuilder} = require('@discordjs/builders');
const {generateRanking} = require("../../controllers/rank.js");

module.exports = {
    usage: "<type>",
    help: "Returns the current ranking of members on various options. \n<type> can be one of 'EB' (earnings bonus)," +
        "'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs total), 'D' (drones), 'LEG' (legendary artifacts) " +
        "or 'PRES' (prestiges).\nIf no type is provided, a ranking overview is returned",
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Returns the current ranking of members on various options.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Can be one of 'EB', 'SE', 'PE', 'GE', 'GET', 'D' or 'LEG'.")
                .addChoice("Earnings bonus", "EB")
                .addChoice("Soul eggs", "SE")
                .addChoice("Eggs of prophecy", "PE")
                .addChoice("Golden eggs", "GE")
                .addChoice("Drone take downs", "D")
                .addChoice("Legendary artifacts", "LEG")
                .addChoice("Prestiges", "PRES")
                .setRequired(false)),
    async execute(interaction) {
        let type = interaction.options.getString("type");
        await interaction.deferReply();

        try {
            await generateRanking(interaction, type);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "rank",
    usage: "<type>",
    description: "Returns the current ranking of members on various options. <type> can be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total), 'D' (drones) or 'LEG' (Legendaries).",
    help: "Returns the current ranking of members on various options. <type> can be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total), 'D' (drones) or 'LEG' (Legendaries).",
    async execute(message, args) {
        const type = args[0];
        let waitingMessage;

        try {
            // ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await generateRanking(message, type);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
*/
