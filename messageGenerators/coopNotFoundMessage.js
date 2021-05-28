exports.getCoopNotFoundMessage = (contractId, coopCode) => {
    return `I couldn't find a coop with the code ${coopCode} for contract ${contractId}. Sorry.`;
}
