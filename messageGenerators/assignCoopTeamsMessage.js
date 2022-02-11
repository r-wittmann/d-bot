const generateGroupFields = (groups) => {
    groups = groups.map((group, i) => ({
        name: `Group ${i + 1}`,
        value: group.map(m => m.inGameName).join("\n"),
        inline: true
    }))
    return groups;
}

exports.getAssignCoopTeamsMessage = (contractName, contractId, groups) => {
    return {
        color: 0x0099ff,
        title: contractName,
        description: "Based on earning bonus and the chance, I suggest the following teams",
        fields: generateGroupFields(groups),
        timestamp: new Date()
    };
}
