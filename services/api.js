const fetch = require("node-fetch");
const protobuf = require("protobufjs");

const decodeService = require("./decode.js");
const encodeService = require("./encode.js");
const userInfo = require("./version");

const API_ROOT = "https://afx-2-dot-auxbrainhome.appspot.com";

const request = async (endpoint, encodedPayload) => {
  const url = API_ROOT + endpoint;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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

const requestCoopStatus = async (contractId, coopCode) => {
  const root = await protobuf.load("./protobuf/ei.proto");
  const ContractCoopStatusRequest = root.lookupType("ei.ContractCoopStatusRequest");
  const ContractCoopStatusResponse = root.lookupType("ei.ContractCoopStatusResponse");

  const userId = '';
  const requestPayload = {
    rinfo: basicRequestInfo(userId),
    contractIdentifier: contractId,
    coopIdentifier: coopCode,
    userId,
    clientVersion: userInfo.CLIENT_VERSION,
  };
  const encodedRequestPayload = encodeService.encodeMessage(ContractCoopStatusRequest, requestPayload);
  const encodedResponsePayload = await request('/ei/coop_status', encodedRequestPayload);
  const status = decodeService.decodeMessage(
    ContractCoopStatusResponse,
    encodedResponsePayload,
    true
  );
  if (!status.localTimestamp) {
    status.localTimestamp = Date.now() / 1000;
  }
  return status;
}
exports.requestCoopStatus = requestCoopStatus;

const getMatchingContract = async (contractId) => {
  const root = await protobuf.load("./protobuf/ei.proto");
  const Contract = root.lookupType("ei.Contract");

  const availableContractsResponse = await fetch("https://raw.githubusercontent.com/fanaticscripter/CoopTracker/master/data/contracts.json")
  const availableContracts = await availableContractsResponse.json();
  const matchingContract = availableContracts.slice().reverse().find(
      contract => {
        return contract.id === contractId
      }
  );
  return decodeService.decodeMessage(Contract, matchingContract.proto);
}
exports.getMatchingContract = getMatchingContract;

const basicRequestInfo = (userId) => {
  return {
    eiUserId: userId,
    clientVersion: userInfo.CLIENT_VERSION,
    version: userInfo.APP_VERSION,
    build: userInfo.APP_BUILD,
    platform: userInfo.PLATFORM_STRING,
  };
}
