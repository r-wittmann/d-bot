const protobuf = require("protobufjs");

const api = require("../services/dataAccess/auxbrainApi.js");
const {decodeMessage} = require("../services/auxbrain/decode.js");

exports.getMatchingContract = async (contractId) => {
    const root = await protobuf.load("./services/auxbrain/protobuf/ei.proto");
    const Contract = root.lookupType("ei.Contract");

    // get the last 30 contracts
    const allContracts = await api.getAllContractsList();

    // search for the matching contract. Reversed so that the later contract is
    // returned in the unlikely event of two contracts with the same contract id
    const matchingContract = allContracts.reverse().find(
        contract => {
            return contract.id === contractId
        }
    );
    if (!matchingContract) return;

    return await decodeMessage(Contract, matchingContract.proto, false);
}