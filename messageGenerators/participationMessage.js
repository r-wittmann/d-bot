const AsciiTable = require("ascii-table");

const getNameTable = (names) => {
    const table = new AsciiTable()
    table.setHeading("EGG INC NAME");
    names.forEach(name => {
        table.addRow(name);
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
    const messageContent = active.length === 0
        ? "No one is currently part of a coop."
        : getNameTable(active)
    return {
        color: 0x0099ff,
        description: `Here is a list of active players:\n` + messageContent
    }
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
