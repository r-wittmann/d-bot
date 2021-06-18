
const generateCoopFields = (contractId, coops, maxCoopSize, curCoopSizes) => {
    let coopObject = [];
    coops.forEach((coop, i) => {
        coopObject.push({
            name: `Coop Code "${coop}"`,
            value: `${curCoopSizes ? curCoopSizes[i] : "xx"}/${maxCoopSize} players\n[Coop Tracker](https://eicoop.netlify.app/${contractId}/${coop})`,
        })
    })
    return coopObject;
}

exports.getActiveCoopsMessage = (contractName, contractId, coopCodes, maxCoopSize, curCoopSizes) => {

    return {
        color: 0x0099ff,
        title: contractName,
        description: `Here is a list of all currently active coops for ${contractName} (${contractId})`,
        fields: [
            generateCoopFields(contractId, coopCodes, maxCoopSize, curCoopSizes)
        ],
        footer: {
            text: `Max coop size: ${maxCoopSize}`
        },
        timestamp: new Date()
    };
}
