const AsciiTable = require("ascii-table");

exports.getMemberListMessage = (members) => {
    // sort members alphabetically
    members.sort((a,b)=>a.discordName.localeCompare(b.discordName));

    // create table for member display
    const table = new AsciiTable()
    table.setHeading("", "Discord Name", "Game Name", "EI id");
    members.forEach((member, i) => {
       table.addRow(i+1, member.discordName, member.inGameName, member.eiId);
    })

    return `\`\`\`\n${table.toString()}\`\`\``;
}
