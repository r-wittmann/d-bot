const AsciiTable = require("ascii-table");

const getNameOnlyFields = (header, emptyMessage, continueText, list) => {
    if (list.length === 0) {
        return {
            name: header,
            value: emptyMessage,
            inline: false,
        };
    }

    // split the list in chunks of 10 to avoid the message being to long
    const chunkedList = [];
    for (let i = 0; i < list.length; i += 10) {
        chunkedList.push(list.slice(i, i + 10));
    }

    const fields = [];
    // create first element
    fields.push({
        name: header,
        value: getNameOnlyTable(chunkedList.shift()),
        inline: false,
    });

    // create rest of fields
    if (chunkedList.length > 0) {
        for (let sublist of chunkedList) {
            fields.push({
                name: continueText,
                value: getNameOnlyTable(sublist),
                inline: false,
            });
        }
    }

    return fields;
}

const getNameOnlyTable = (names) => {
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
            name: "Here is a list of active players:",
            value: "No one has started a coop yet.",
            inline: false,
        };
    }

    // split the list in chunks of 10 to avoid the message being to long
    const chunkedList = [];
    for (let i = 0; i < list.length; i += 10) {
        chunkedList.push(list.slice(i, i + 10));
    }

    const fields = [];
    // create first element
    fields.push({
        name: "Here is a list of active players:",
        value: getNameAndCoopCodeTable(chunkedList.shift()),
        inline: false,
    });

    // create rest of fields
    if (chunkedList.length > 0) {
        for (let sublist of chunkedList) {
            fields.push({
                name: "Active players continued:",
                value: getNameAndCoopCodeTable(sublist),
                inline: false,
            });
        }
    }

    return fields;
}

const getNameAndCoopCodeTable = (list) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME", "COOP CODE");
    list.forEach(element => {
        table.addRow(element.inGameName, element.coopCode.substring(0, 24));
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
                getNameOnlyFields(
                    "The contract was already completed by:",
                    "No one yet.",
                    "Completed list continued",
                    completed
                ),
                {name: '\u200B', value: '\u200B', inline: false},
                getActiveFields(active),
                {name: '\u200B', value: 'Please note that coop codes are truncated at 24 characters', inline: false},
                {name: '\u200B', value: '\u200B', inline: false},
                getNameOnlyFields(
                    "These players have not yet joined a coop:",
                    "All members are provided for :)",
                    "Need to join players continued:",
                    needToJoin
                )
            ],
            timestamp: new Date()
        }
    }
}
