const AsciiTable = require("ascii-table");

const getActivityTable = (members) => {
    const table = new AsciiTable()
    table.setHeading("", "EGG INC NAME", "LAST ACTIVITY");
    members.forEach((member, i) => {
        table.addRow(i + 1, member.inGameName, member.timeSinceLastActivity);
    })
    table.setAlign(2, AsciiTable.RIGHT);
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getMembersActivityMessage = (members) => {
    return {
        color: 0x0099ff,
        title: `Members Activity`,
        description: getActivityTable(members),
        footer: {
            text: "Activity in days, hours:minutes:seconds"
        },
        timestamp: new Date()
    };
}
