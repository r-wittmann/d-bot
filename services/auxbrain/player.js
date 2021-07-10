const protobuf = require("protobufjs");
const encodeService = require("../auxbrain/encode.js");
const decodeService = require("../auxbrain/decode.js");
const auxbrainApi = require("../dataAccess/auxbrainApi.js");
const {CLIENT_VERSION} = require("../auxbrain/version.js");

exports.getPlayerByEiId = async (id) => {
    const root = await protobuf.load("./services/auxbrain/protobuf/ei.proto");
    const EggIncFirstContactRequest = root.lookupType("ei.EggIncFirstContactRequest");
    const EggIncFirstContactResponse = root.lookupType("ei.EggIncFirstContactResponse");

    const requestPayload = {
        rinfo: auxbrainApi.basicRequestInfo(id),
        eiUserId: id,
        clientVersion: CLIENT_VERSION,
    };
    const encodedRequestPayload = encodeService.encodeMessage(EggIncFirstContactRequest, requestPayload);
    let encodedResponsePayload = await auxbrainApi.EIApiRequest('/ei/first_contact', encodedRequestPayload);

    return await decodeService.decodeMessage(EggIncFirstContactResponse, encodedResponsePayload, true);
}