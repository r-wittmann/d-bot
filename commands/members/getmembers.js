const {SlashCommandBuilder} = require('@discordjs/builders');
const {getMembers} = require("../../controllers/members.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getmembers")
        .setDescription("Returns a formatted list of all members with their discord and in game names."),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            await getMembers(interaction);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "getmembers",
    usage: "",
    description: "Returns a formatted list of all members with their discord and in game names. May take a few moments.",
    help: "Returns a formatted list of all members with their discord and in game names.\n" +
        "Discord names are fetched every time the command is called, so they are always up to date. " +
        "In game names are stored in a database. If you want to update your in game name, please tell Quacking.\n" +
        "May take a few moments.",
    async execute(message) {
        let waitingMessage;

        try {
            // Send a "in progress" message. Ignore warning below. That's not true
            waitingMessage = await message.channel.send("This may take a few moments\nWorking on it...");

            await getMembers(message);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }

        // remove "in progress" message
        await waitingMessage.delete();
    },
};
*/
