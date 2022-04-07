const AsciiTable = require("ascii-table");

const typeMatching = {
    EB: "Earnings Bonus",
    SE: "Soul Eggs",
    PE: "Eggs of Prophecy",
    GE: "Golden Eggs Total",
    D: "Drones",
    LEG: "Legendary Artifacts",
    PRES: "Prestiges",
}

const getRankingTable = (members, type) => {
    const table = new AsciiTable();
    table.setHeading("", "EGG INC NAME", "VALUE");
    members.forEach((member, i) => {
        table.addRow(i + 1, member.inGameName, member[type].count);
    })
    table.setAlign(2, AsciiTable.RIGHT);
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getRankingByTypeMessage = (members, type) => {
    return {
        color: 0x0099ff,
        title: `Ranking by ${typeMatching[type]}`,
        description: getRankingTable(members, type),
    };
}

const getOverviewTable = (member) => {
    const table = new AsciiTable();
    table.setHeading("TYPE", "VALUE", "RANK");

    for (let key in typeMatching) {
        table.addRow(typeMatching[key], member[key].count, member[key].rank);
    }

    table.setAlign(1, AsciiTable.RIGHT);
    table.setAlign(2, AsciiTable.RIGHT);
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getRankingOverview = (member) => {
    return {
        color: 0x0099ff,
        title: `Overview of Rankings for ${member.inGameName}`,
        description: getOverviewTable(member),
    };
}
