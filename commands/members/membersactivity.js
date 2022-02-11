const {SlashCommandBuilder} = require('@discordjs/builders');
const {checkMembersActivity} = require("../../controllers/members.js");

module.exports = {
    help: "Command is restricted for mod use in mod-talk!" +
        "May take a few moments.",
    data: new SlashCommandBuilder()
        .setName("membersactivity")
        .setDescription("Command is restricted for mod use in mod-talk!"),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            // check for the correct channel id
            if (interaction.channelId !== process.env.MOD_CHANNEL_ID) {
                throw new Error("This command can only be executed in the mod channel.");
            }
            await checkMembersActivity(interaction);
        } catch (e) {
            await interaction.editReply({content: "Something went wrong.\n" + e.message, ephemeral: true});
        }
    }
};
