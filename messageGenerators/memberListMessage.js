const AsciiTable = require("ascii-table");

exports.getMemberListMessage = (members, index) => {

    // create table for member display
    const table = new AsciiTable()
    if (index === 0) {
        table.setHeading("", "DISCORD NAME", "EGG INC NAME");
    }
    members.forEach((member, i) => {
       table.addRow(index * 10 + i + 1, member.discordName, member.inGameName);
    })

    return `\`\`\`\n${table.toString()}\`\`\``;
}
