const AsciiTable = require("ascii-table");

const getCompletedTable = (names) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME");
    names.forEach(name => {
        table.addRow(name);
    })
    return `\`\`\`\n${table.toString()}\`\`\``;
}
const getActiveFields = (list) => {
    if (list.length === 0) {
        return {
            name: "Here is a list of active contractors:",
            value: "No one has started this contract yet.",
            inline: false,
        };
    }
    // if the list is to long, split it in two
    if (list.length > 12) {
        return [
            {
                name: "Here is a list of active contractors:",
                value: getActiveTable(list.slice(0, Math.ceil(list.length / 2))),
                inline: false,
            },
            {
                name: "Active contractors continued:",
                value: getActiveTable(list.slice(Math.ceil(list.length / 2), list.length)),
                inline: false,
            },
        ]
    }
    return {
        name: "Here is a list of active contractors:",
        value: getActiveTable(list),
        inline: false,
    }
}

const getActiveTable = (list) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME", "COOP CODE");
    list.forEach(element => {
        table.addRow(element.inGameName, element.coopCode.substring(0, 24));
    })
    return `\`\`\`\n${table.toString()}\`\`\``;
}

const getNeedToJoinTable = (names) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME");
    names.forEach(name => {
        table.addRow(name);
    })
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getParticipationMessage = (contractId, completed, active, needToJoin) => {
    return {
        embed: {
            color: 0x0099ff,
            title: "Participation",
            description: `Here is a participation overview for ${contractId}`,
            fields: [
                {
                    name: "The contract was already completed by:",
                    value: completed.length > 0
                        ? getCompletedTable(completed)
                        : "No one yet.",
                    inline: false,
                },
                getActiveFields(active),
                {
                    name: "These players have not yet joined a coop:",
                    value: needToJoin.length > 0
                        ? getNeedToJoinTable(needToJoin)
                        : "All members are provided for :)",
                    inline: false,
                },

            ],
            footer: {
                text: "Please note that coop codes are truncated at 24 characters",
            },
        }
    }
}
