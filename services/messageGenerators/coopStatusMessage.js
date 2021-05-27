const {
    calculateEggsPerHour,
    calculateNeededProduction,
    calculateTimeToCompletion,
    secondsToDateString
} = require("../utils.js");
const {formatEIValue} = require("../units.js");

const generateGoalsObject = (goals, eggsShipped) => {
    let goalsObject = [];
    goals.forEach((goal, i) => {
        let goalAmount = goal.targetAmount;
        let completedString = eggsShipped > goalAmount ? "completed :white_check_mark:" : "open";
        goalsObject.push({
            name: `Goal ${i + 1}`,
            value: `${formatEIValue(goalAmount, true)}\n${completedString}`,
            inline: true,
        })
    })
    return goalsObject;
}

exports.coopStatusMessage = (coopStatus, contract) => {
    const contractName = contract.name;
    const contractId = contract.identifier;
    const description = contract.description;

    const coopId = coopStatus.coopIdentifier
    const maxCoopSize = contract.maxCoopSize;
    const curCoopSize = coopStatus.contributors.length;
    const finalGoalAmount = contract.goals.slice(-1).pop().targetAmount;

    const eggsShipped = coopStatus.totalAmount;
    const currentProd = calculateEggsPerHour(coopStatus);
    const neededProd = calculateNeededProduction(coopStatus, contract)

    const secondsExpected = calculateTimeToCompletion(coopStatus, contract);
    const secondsRemaining = coopStatus.secondsRemaining;

    return {
        color: 0x0099ff,
        title: `${contractName} (${contractId})`,
        description: `${description}\n[Coop Tracker](https://eicoop.netlify.app/${contractId}/${coopId})`,
        fields: [
            {
                name: 'Coop Code',
                value: coopId,
                inline: true,
            },
            {
                name: 'Players',
                value: `${curCoopSize}/${maxCoopSize}`,
                inline: true,
            },
            {
                name: 'Eggs Shipped',
                value: `${formatEIValue(eggsShipped)} of ${formatEIValue(finalGoalAmount, true)}`,
            },
            {
                name: 'Hourly Production',
                value: `Current: ${formatEIValue(currentProd)}/h, required: ${formatEIValue(neededProd)}/h`,
            },
            {
                name: 'Time to Completion',
                value: `Expected: ${secondsToDateString(secondsExpected)}, remaining: ${secondsToDateString(secondsRemaining)}`,
            },
            generateGoalsObject(contract.goals, eggsShipped)
        ],
    };
}
