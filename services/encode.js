const btoa = require("btoa");

const utils = require("./utils.js");

const encodeMessage = (message, messageObj, authenticated = false) => {
    if (authenticated) {
        throw new Error(`Authenticated encoding not implemented.`);
    }

    try {
        const buf = message.encode(messageObj).finish();
        return btoa(utils.uint8ArrayToBinaryString(buf));
    } catch (e) {
        throw new Error(`Encoding ${JSON.stringify(messageObj)}: ${e}.`);
    }
}
exports.encodeMessage = encodeMessage;
