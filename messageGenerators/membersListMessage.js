const AsciiTable = require("ascii-table");

exports.getMemberListMessage = (members) => {
    // sort members alphabetically
    members.sort((a, b) => a.discordName.localeCompare(b.discordName));

    // create table for member display
    const table = new AsciiTable()
    table.setHeading("", "DISCORD NAME", "EGG INC NAME");
    members.forEach((member, i) => {
        table.addRow(i + 1, member.discordName, member.inGameName);
    })

    return `\`\`\`\n${table.toString()}\`\`\``;
}

