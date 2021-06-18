const fetch = require("node-fetch");
const userInfo = require("./version.js");
const protobuf = require("protobufjs");
const encodeService = require("./encode.js");
const decodeService = require("./decode.js");
const {CLIENT_VERSION} = require("./version.js");

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
    const root = await protobuf.load("./protobuf/ei.proto");
    const EggIncFirstContactRequest = root.lookupType("ei.EggIncFirstContactRequest");
    const EggIncFirstContactResponse = root.lookupType("ei.EggIncFirstContactResponse");

    const requestPayload = {
        rinfo: basicRequestInfo(id),
        eiUserId: id,
        clientVersion: CLIENT_VERSION,
    };
    const encodedRequestPayload = encodeService.encodeMessage(EggIncFirstContactRequest, requestPayload);
    let encodedResponsePayload;
    try {
        encodedResponsePayload = await EIApiRequest('/ei/first_contact', encodedRequestPayload);
    } catch (e) {
        console.log("Something went wrong\n", e.message);
    }

    return await decodeService.decodeMessage(EggIncFirstContactResponse, encodedResponsePayload, true);
}

exports.getAllContractsList = async () => {
    const availableContractsResponse = await fetch("https://raw.githubusercontent.com/fanaticscripter/EggContractor/master/misc/ContractAggregator/data/contracts.csv")
    const availableContractsCsv = await availableContractsResponse.text();
    const availableContractsLines = availableContractsCsv.split("\n");
    const availableContracts = [];
    for (const line of availableContractsLines) {
        availableContracts.push({
            id: line.split(",")[0],
            proto: line.split(",").pop(),
        });

    }
    // as some of the contract ids don't get updated for the legacy run,
    // only the last 10 weeks (30 contracts) are considered.
    return availableContracts.slice(-30);
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
