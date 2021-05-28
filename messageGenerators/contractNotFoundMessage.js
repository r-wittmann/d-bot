exports.getContractNotFoundMessage = (contractId) => {
    return `The contract ID seems to be wrong, or the contract information was not added to my database yet. No contract found with id ${contractId}`;
}
