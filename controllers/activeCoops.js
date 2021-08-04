const {log} = require("../services/logService.js");
const {createActiveCoopChannel, deleteActiveCoopChannel} = require("../services/dataAccess/discord.js");
const {
    addActiveContract,
    getActiveContractById,
    updateActiveContract,
    removeActiveContract
} = require("../services/dataAccess/database.js");

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

exports.removeActiveCoop = async (message, contractId, coopCode) => {
    // coop codes can not be capitalized. Because autocorrect sometimes capitalizes words, we need to decapitalize it
    coopCode = coopCode.toLowerCase();

    // get matching contract from database
    const activeContract = await getActiveContractById(contractId);
    if (!activeContract) {
        throw new Error(`The contract \`${contractId}\` is not in the list of active contracts.`);
    }

    // if coop is not in the list of active coops, throw
    if (!activeContract.activeCoops.includes(coopCode)) {
        throw new Error(`The coop \`${coopCode}\` is not in the list of active coops for contract \`${contractId}\`.`);
    }

    // remove coop code from active coops
    const updatedActiveCoops = activeContract.activeCoops.filter(coop => coop !== coopCode);
    if (updatedActiveCoops.length > 0) {
        await updateActiveContract(activeContract.contractId, updatedActiveCoops);
        await log(message.client, "Coop removed from active coops.");
        await message.channel.send("Coop removed from active coops.");
    } else {
        await removeActiveContract(contractId);
        await log(message.client, "Coop and contract removed from active coops.");
        await message.channel.send("Coop and contract removed from active coops.");
    }

    // remove coop channel
    await deleteActiveCoopChannel(message, contractId, coopCode);
    await log(message.client, "Coop channel deleted");

    // add coop to completed coop channel
    const completedCoopChannel = await message.client.channels.cache.get(process.env.COMPLETED_COOP_CHANNEL_ID);
    await completedCoopChannel.send(`${contractId}: \`${coopCode}\``);
    await log(message.client, "Coop added to completed coops");

    // call $updateactivecoops to fill active coop message with information
    await message.channel.send("$updateactivecoops");
}
