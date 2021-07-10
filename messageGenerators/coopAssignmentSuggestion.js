const generateGroupFields = (groups) => {
    const groupObject = [];
    for (let group of groups) {
        group = group.map(m => m.inGameName);
    }
    return groups.map((group, i) => ({
        name: `Group ${i + 1}`,
        value: group.map(m => m.inGameName),
        inline: true
    }))
}

exports.getCoopAssignmentSuggestionMessage = (contractName, contractId, groups) => {
    return {
        color: 0x0099ff,
        title: contractName,
        description: "Based on both earning bonus and the contribution potential, I suggest the following teams",
        fields: [
            generateGroupFields(groups)
        ],
        timestamp: new Date()
    };
}
