const protobuf = require("protobufjs");

const api = require("../services/auxbrain/api.js");
const encodeService = require("../services/auxbrain/encode.js");
const decodeService = require("../services/auxbrain/decode.js");
const {CLIENT_VERSION} = require("../services/auxbrain/version.js");

exports.getCoopStatus = async (contractId, coopCode) => {
    const root = await protobuf.load("./protobuf/ei.proto");
    const ContractCoopStatusRequest = root.lookupType("ei.ContractCoopStatusRequest");
    const ContractCoopStatusResponse = root.lookupType("ei.ContractCoopStatusResponse");

    // set user id to "" as it is required in the message, but the content doesn't matter
    const userId = "";
    const requestPayload = {
        rinfo: api.basicRequestInfo(userId),
        contractIdentifier: contractId,
        coopIdentifier: coopCode,
        userId,
        clientVersion: CLIENT_VERSION,
    };

    // encode the request payload and call the API with it
    const encodedRequestPayload = encodeService.encodeMessage(ContractCoopStatusRequest, requestPayload);
    let encodedResponsePayload;
    try {
        encodedResponsePayload = await api.EIApiRequest('/ei/coop_status', encodedRequestPayload);
    } catch (e) {
        return;
    }

    // decode the response an return
    return await decodeService.decodeMessage(ContractCoopStatusResponse, encodedResponsePayload, true);
}
