const fetch = require("node-fetch");
const userInfo = require("./version.js");

const API_ROOT = "https://afx-2-dot-auxbrainhome.appspot.com";

exports.EIApiRequest = async (endpoint, encodedPayload) => {
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

exports.getAllContractsList = async () => {
    const availableContractsResponse = await fetch("https://raw.githubusercontent.com/fanaticscripter/CoopTracker/master/data/contracts.json")
    const availableContracts = await availableContractsResponse.json();
    // as some of the contract ids don't get updated for the legacy run,
    // only the last 10 weeks (30 contracts) are considered.
    return availableContracts.slice(-30);
}

exports.basicRequestInfo = (userId) => {
    return {
        eiUserId: userId,
        clientVersion: userInfo.CLIENT_VERSION,
        version: userInfo.APP_VERSION,
        build: userInfo.APP_BUILD,
        platform: userInfo.PLATFORM_STRING,
    };
}
