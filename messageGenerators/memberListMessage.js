
exports.getMemberListMessage = (members) => {
    return {
        color: 0x0099ff,
        title: `Current Members`,
        fields: members.map(member => {
            return {
                name: `Discord Id: ${member.discordId}`,
                value: `EI Id: ${member.eiId}`,
                inline: false,
            }
        })
    };
}
