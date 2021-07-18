const AsciiTable = require("ascii-table");

const typeMatching = {
    EB: "Earnings Bonus",
    SE: "Soul Eggs",
    PE: "Eggs of Prophecy",
    GE: "Golden Eggs Current",
    GET: "Golden Eggs Total",
    D: "Drones"
}

const getRankingTable = (members, type) => {
    const table = new AsciiTable()
    table.setHeading("", "EGG INC NAME", "VALUE");
    members.forEach((member, i) => {
        table.addRow(i + 1, member.inGameName, member[type]);
    })
    table.setAlign(2, AsciiTable.RIGHT);
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getRankingByTypeMessage = (members, type) => {
    return {
        color: 0x0099ff,
        title: `Ranking by ${typeMatching[type]}`,
        description: getRankingTable(members, type),
        footer: {
            text: type === "EB"
                ? "This calculation assumes maxed epic research"
                : type === "D"
                    ? "Drones and elite drones are added"
                    : ""
        }
    };
}
