
const generateCoopFields = (coops) => {
    let coopObject = [];
    coops.forEach((coop) => {
        coopObject.push({
            name: `Coop Code "${coop}"`,
            value: `xyz`,
        })
    })
    return coopObject;
}

exports.getActiveCoopsMessage = (contractName, contractId, coopCodes) => {

    return {
        color: 0x0099ff,
        title: contractName,
        description: `Here is a list of all currently active coops for ${contractName} (${contractId})`,
        fields: [
            generateCoopFields(coopCodes)
        ],
    };
}
