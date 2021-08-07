const {getProgressBar} = require("../services/utils.js");
const {
    calculateEggsPerHour,
    calculateNeededProduction,
    calculateTimeToCompletion,
    secondsToDateString
} = require("../services/utils.js");
const {formatEIValue} = require("../services/auxbrain/units.js");

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

exports.getCoopStatusMessage = (contract, coopStatus) => {
    const contractName = contract.name;
    const contractId = contract.identifier;

    const coopId = coopStatus.coopIdentifier
    const maxCoopSize = contract.maxCoopSize;
    const participants = coopStatus.contributors;
    const curCoopSize = participants.length;
    const finalGoalAmount = contract.goals.slice(-1).pop().targetAmount;

    const eggsShipped = coopStatus.totalAmount;
    const currentProd = calculateEggsPerHour(coopStatus);
    const neededProd = calculateNeededProduction(coopStatus, contract)

    const secondsExpected = calculateTimeToCompletion(coopStatus, contract);
    const secondsRemaining = coopStatus.secondsRemaining;

    return {
        color: 0x0099ff,
        title: `${contractName} (${contractId})`,
        description: `[Coop Tracker](https://eicoop.netlify.app/${contractId}/${coopId})`,
        fields: [
            {
                name: "Coop Code",
                value: coopId,
                inline: true,
            },
            {
                name: "Players",
                value: `${curCoopSize}/${maxCoopSize}`,
                inline: true,
            },
            {
                name: "Eggs Shipped",
                value: `${formatEIValue(eggsShipped)} of ${formatEIValue(finalGoalAmount, true)}`,
                inline: true,
            },
            {
                name: "Hourly Production",
                value: `Current: ${formatEIValue(currentProd)}/h, required: ${formatEIValue(neededProd)}/h`,
                inline: true,
            },
            {
                name: "Time to Completion",
                value: `Expected: ${secondsToDateString(secondsExpected)}, remaining: ${secondsToDateString(secondsRemaining)}`,
                inline: true,
            },
            {
                name: "Progress",
                value: `\`\`\`${getProgressBar(eggsShipped, finalGoalAmount)}\`\`\``,
                inline: false,
            },
            generateGoalsObject(contract.goals, eggsShipped),
            {
                name: "\u200B",
                value: "\u200B"
            },
            {
                name: "Participants",
                value: participants.map(participants => participants.userName).join(", "),
                inline: false,
            }
        ],
    };
}
