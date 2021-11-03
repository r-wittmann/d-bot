const {MessageActionRow, MessageButton} = require("discord.js");

exports.getActiveCoopsChannelHeaderMessage = () => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("updateactivecoops")
                .setLabel("Update Coops")
                .setStyle("PRIMARY"),
        );

    return {
        content: "Here is a list of all active Coops sorted by contracts. Click the button below to update the list. Automatic updates are disabled.",
        components: [row],
    };
}