const atob = require("atob");
const protobuf = require("protobufjs");

const utils = require("./utils.js");

const decodeMessage = async (message, encoded, authenticated = false) => {
    if (!encoded) return;

    if (authenticated) {
        const root = await protobuf.load("./protobuf/ei.proto");
        const AuthenticatedMessage = root.lookupType("ei.AuthenticatedMessage");
        const wrapperPayload = await decodeMessage(
            AuthenticatedMessage,
            encoded,
            false
        );
        if (wrapperPayload.message === null || wrapperPayload.message === undefined) {
            throw new Error('No message found behind wrap.');
        }
        return decodeMessage(message, wrapperPayload.message, false);
    }

    let binary;
    try {
        if (encoded instanceof Uint8Array) {
            // Note that protobuf.js's toObject automatically base64-decodes the
            // bytes, so we shouldn't double-decode. A misfeature if you ask me,
            // making an assumption by default and not offering an easy way out (using
            // conversion options { bytes: String } disables the base64-decode, or
            // rather, re-encodes, but then the type changes from Uint8Array to
            // String, now TypeScript is not happy).
            binary = utils.uint8ArrayToBinaryString(encoded);
        } else {
            binary = atob(encoded);
        }
    } catch (e) {
        throw new Error(`Error decoding input as base64: ${e}`);
    }
    return message.toObject(message.decode(utils.binaryStringToUint8Array(binary)));
}

exports.decodeMessage = decodeMessage;
