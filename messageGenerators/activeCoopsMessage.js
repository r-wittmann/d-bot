const {
    calculateTimeToCompletion,
    getProgressBar,
    secondsToDateString
} = require("../services/utils.js");
const {formatEIValue} = require("../services/auxbrain/units.js");

const generateCoopFields = (activeContract) => {
    const maxCoopSize = activeContract.maxCoopSize;
    const finalGoal = activeContract.goals[activeContract.goals.length - 1].targetAmount;

    let coopObject = [];
    for (let activeCoop of activeContract.activeCoops) {
        const coopCode = activeCoop.coopIdentifier
        const curCoopSize = activeCoop.contributors.length;

        const eggsShipped = activeCoop.totalAmount;

        const secondsExpected = calculateTimeToCompletion(activeCoop, activeContract);

        const progressBar = getProgressBar(eggsShipped, finalGoal);

        coopObject.push({
            name: `Coop Code "${coopCode}"`,
            value: `\`\`\`${curCoopSize}/${maxCoopSize} players\n` +
                `${progressBar}\n` +
                `Finishes in: ${secondsToDateString(secondsExpected)}\`\`\`\t\t` +
                `[Coop Tracker](https://eicoop.netlify.app/${activeContract.identifier}/${coopCode})`,
        })
    }
    return coopObject;
}

exports.getActiveCoopsMessage = (activeContract) => {
    const contractName = activeContract.name;
    const contractId = activeContract.identifier;
    const finalGoal = activeContract.goals[activeContract.goals.length - 1].targetAmount;
    const maxCoopSize = activeContract.maxCoopSize;

    return {
        color: 0x0099ff,
        title: contractName,
        description: `All active coops for ${contractName} (${contractId}).\n` +
            `Final goal: ${formatEIValue(finalGoal, true)}, max coop size: ${maxCoopSize}.\n\u200B`,
        fields: [
            generateCoopFields(activeContract)
        ],
        timestamp: new Date()
    };
}
