const fetch = require("node-fetch");
const userInfo = require("../auxbrain/version.js");
const protobuf = require("protobufjs");
const encodeService = require("../auxbrain/encode.js");
const decodeService = require("../auxbrain/decode.js");
const {CLIENT_VERSION} = require("../auxbrain/version.js");

const API_ROOT = "https://afx-2-dot-auxbrainhome.appspot.com";

const EIApiRequest = async (endpoint, encodedPayload) => {
    const url = API_ROOT + endpoint;
    try {
        const resp = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `data=${encodedPayload}`,
        });
        const text = await resp.text();
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`HTTP ${resp.status}: ${text}`);
        }
        return text;
    } catch (e) {
        throw new Error(`POST ${url} data=${encodedPayload}: ${e}`);
    }
}

exports.EIApiRequest = EIApiRequest;

exports.getPlayerByEiId = async (id) => {
    const root = await protobuf.load("./services/auxbrain/protobuf/ei.proto");
    const EggIncFirstContactRequest = root.lookupType("ei.EggIncFirstContactRequest");
    const EggIncFirstContactResponse = root.lookupType("ei.EggIncFirstContactResponse");

    const requestPayload = {
        rinfo: basicRequestInfo(id),
        eiUserId: id,
        deviceId: 'franks_team_bot',
        clientVersion: CLIENT_VERSION,
    };
    const encodedRequestPayload = encodeService.encodeMessage(EggIncFirstContactRequest, requestPayload);
    let encodedResponsePayload;
    try {
        encodedResponsePayload = await EIApiRequest('/ei/bot_first_contact', encodedRequestPayload);
    } catch (e) {
        throw e;
    }

    return await decodeService.decodeMessage(EggIncFirstContactResponse, encodedResponsePayload, false);
}

exports.getCoopStatus = async (contractId, coopCode) => {
    const root = await protobuf.load("./services/auxbrain/protobuf/ei.proto");
    const ContractCoopStatusRequest = root.lookupType("ei.ContractCoopStatusRequest");
    const ContractCoopStatusResponse = root.lookupType("ei.ContractCoopStatusResponse");

    // set user id to "" as it is required in the message, but the content doesn't matter
    const userId = "";
    const requestPayload = {
        rinfo: basicRequestInfo(userId),
        contractIdentifier: contractId,
        coopIdentifier: coopCode,
        userId,
        clientVersion: CLIENT_VERSION,
    };

    // encode the request payload and call the API with it
    const encodedRequestPayload = encodeService.encodeMessage(ContractCoopStatusRequest, requestPayload);
    let encodedResponsePayload;
    try {
        encodedResponsePayload = await EIApiRequest('/ei/coop_status', encodedRequestPayload);
    } catch (e) {
        return;
    }

    // decode the response an return
    return await decodeService.decodeMessage(ContractCoopStatusResponse, encodedResponsePayload, true);
}

const getAllContractsList = async () => {
    const availableContractsResponse = await fetch("https://raw.githubusercontent.com/fanaticscripter/Egg/master/contracts/data/contracts.json")
    const availableContracts = await availableContractsResponse.json();

    // as some of the contract ids don't get updated for the legacy run,
    // only the last 10 weeks (30 contracts) are considered.
    return availableContracts.slice(-30);
}
exports.getAllContractsList = getAllContractsList;

exports.getMatchingContract = async (contractId) => {
    const root = await protobuf.load("./services/auxbrain/protobuf/ei.proto");
    const Contract = root.lookupType("ei.Contract");

    // get the last 30 contracts
    const allContracts = await getAllContractsList();

    // search for the matching contract. Reversed so that the later contract is
    // returned in the unlikely event of two contracts with the same contract id
    const matchingContract = allContracts.reverse().find(
        contract => {
            return contract.id === contractId
        }
    );
    if (!matchingContract) return;

    return await decodeService.decodeMessage(Contract, matchingContract.proto, false);

}

const basicRequestInfo = (userId) => {
    return {
        eiUserId: userId,
        clientVersion: userInfo.CLIENT_VERSION,
        version: userInfo.APP_VERSION,
        build: userInfo.APP_BUILD,
        platform: userInfo.PLATFORM_STRING,
    };
}
exports.basicRequestInfo = basicRequestInfo;
