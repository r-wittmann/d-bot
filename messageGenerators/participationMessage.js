const AsciiTable = require("ascii-table");

const getNameTable = (names) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME");
    names.forEach(name => {
        table.addRow(name);
    })
    return `\`\`\`\n${table.toString()}\`\`\``;
}

const getNameAndCoopCodeTable = (list) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME", "COOP CODE");
    list.forEach(element => {
        table.addRow(element.inGameName, element.coopCode.substring(0, 24));
    })
    return `\`\`\`\n${table.toString()}\`\`\``;
}

exports.getCompletedMessage = (contractId, completed) => {
    const messageContent = completed.length === 0
        ? "No one yet."
        : getNameTable(completed)
    return {
        color: 0x0099ff,
        title: `Participation in  ${contractId}`,
        description: `The contract was already completed by:\n` + messageContent
    }
}

exports.getActiveMessage = (contractId, active) => {
    if (active.length === 0) {
        return {
            name: "Here is a list of active players:",
            value: "No one has started a coop yet.",
            inline: false,
        };
    }

    // split the list in chunks of 15 to avoid the message being to long
    const chunkedList = [];
    for (let i = 0; i < active.length; i += 15) {
        chunkedList.push(active.slice(i, i + 15));
    }

    const activeEmbeds = [];
    // create first element
    activeEmbeds.push({
        color: 0x0099ff,
        description: "Here is a list of active players:\n" + getNameAndCoopCodeTable(chunkedList.shift()),
        footer: {text: "Coop codes are truncated after 24 characters for display purposes."}
    });

    // create rest of fields
    for (let sublist of chunkedList) {
        activeEmbeds.push({
            color: 0x0099ff,
            description: "Active players continued:\n" + getNameAndCoopCodeTable(sublist),
            footer: {text: "Coop codes are truncated after 24 characters for display purposes."}
        });
    }

    return activeEmbeds;
}

exports.getNeedToJoinMessage = (contractId, needToJoin) => {
    const messageContent = needToJoin.length === 0
        ? "All members are provided for :)"
        : getNameTable(needToJoin)
    return {
        color: 0x0099ff,
        description: `These players have not yet joined a coop:\n` + messageContent,
        timestamp: new Date()
    }
}
