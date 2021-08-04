const {log} = require("../services/logService.js");
const {createActiveCoopChannel} = require("../services/dataAccess/discord.js");
const {addActiveContract, getActiveContractById, updateActiveContract} = require("../services/dataAccess/database.js");

exports.addActiveCoop = async (message, contractId, coopCode) => {
    // coop codes can not be capitalized. Because autocorrect sometimes capitalizes words, we need to decapitalize it
    coopCode = coopCode.toLowerCase();

    // check if contract exists in active contracts
    let activeContract = await getActiveContractById(contractId);
    if (!activeContract) {
        // todo: check if the contract id actually exists
        activeContract = await addActiveContract(contractId);
        await log(message.client, `Contract \`${contractId}\` added to active contracts.`);
    }

    // check, if the coop code already exists in the list of active coops
    if (activeContract.activeCoops.includes(coopCode)) {
        throw new Error(`Coop code \`${coopCode}\` already exists for contract \`${contractId}\`.`);
    }

    // add coop to list of active coops
    await updateActiveContract(activeContract.contractId, activeContract.activeCoops.concat([coopCode]));
    await log(message.client, `Coop code \`${coopCode}\` added to active coops.`);

    // create channel
    await createActiveCoopChannel(message, contractId, coopCode);
    await log(message.client, "Coop channel created.");
    await message.channel.send("Coop added to active coops.");

    // call $updateactivecoops to fill active coop message with information
    await message.channel.send("$updateactivecoops");
}