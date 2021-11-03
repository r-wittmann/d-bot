const {SlashCommandBuilder} = require('@discordjs/builders');
const {updateActiveCoops} = require("../../controllers/activeCoops.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updateactivecoops")
        .setDescription("Updates the active coops in the active coop channel."),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});

        try {
            await updateActiveCoops(interaction);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};

/*
module.exports = {
    name: "updateactivecoops",
    usage: "",
    description: "Updates the active coops in the active coop channel.",
    help: "Updates the active coops in the active coop channel. This command is called automatically after an active " +
        "coop was added or removed. Additionally, this command is automatically performed once a minute.",
    async execute(message) {

        try {
            await updateActiveCoops(message);
        } catch (e) {
            await log(message.client, e.message, e.stack);
            await message.channel.send("Something went wrong.\n" + e.message);
        }
    },
};
*/
