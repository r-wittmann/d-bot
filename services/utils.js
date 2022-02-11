exports.uint8ArrayToBinaryString = (a) => {
    return Array.from(a)
        .map(c => String.fromCharCode(c))
        .join('');
}

exports.binaryStringToUint8Array = (b) => {
    const buf = new Uint8Array(new ArrayBuffer(b.length));
    for (let i = 0; i < b.length; i++) {
        buf[i] = b.charCodeAt(i);
    }
    return buf;
}

// Trim trailing zeros, and possibly the decimal point.
exports.trimTrailingZeros = (s) => {
    s = s.replace(/0+$/, '');
    if (s.endsWith('.')) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}

exports.calculateEarningsBonus = (backup) => {
    const soulEggs = backup.game.soulEggsD;
    const prophecyEggs = backup.game.eggsOfProphecy;

    const epicResearches = backup.game?.epicResearch || [];

    let soulFoodLevel = 0;
    for (const r of epicResearches) {
        if (r.id === 'soul_eggs') {
            soulFoodLevel = r.level;
        }
    }

    let prophecyBonusLevel = 0;
    for (const r of epicResearches) {
        if (r.id === 'prophecy_bonus') {
            prophecyBonusLevel = r.level;
        }
    }

    const soulEggBonus = 0.1 + soulFoodLevel * 0.01;
    const prophecyEggBonus = 0.05 + prophecyBonusLevel * 0.01;

    return 100 * soulEggs * soulEggBonus * (1 + prophecyEggBonus) ** prophecyEggs;
}

exports.calculateContributionPotential = (member, previousContracts) => {

    // get contract information from the archive, filtering for the relevant contract ids and coopAllowed
    const completedContracts = member.backup.contracts.archive.filter(contract =>
        previousContracts.includes(contract.contract.identifier) &&
        contract.contract.coopAllowed &&
        contract.league === 0 &&
        // this contract had a goal bug, that messes up the whole calculation
        contract.contract.identifier !== 'artifact-repair'
    );

    const contributions = completedContracts.map(contract => {
        const memberContribution = contract.coopLastUploadedContribution;
        const lastGoal = contract.lastAmountWhenRewardGiven;
        const maxCoopSize = contract.contract.maxCoopSize;

        return memberContribution / (lastGoal / maxCoopSize) || 0.01;
    });

    return Object.assign({}, member, {contributionPotential: contributions.reduce((a, b) => a + b, 0) / contributions.length});
}

const calculateEggsPerHour = (coopStatus) => {
    let eggsPerSecond = 0;
    coopStatus.contributors.forEach(contributor => eggsPerSecond += contributor.contributionRate);
    return eggsPerSecond * 3600;
}
exports.calculateEggsPerHour = calculateEggsPerHour;

exports.calculateNeededProduction = (coopStatus, matchingContract) => {
    const produced = coopStatus.totalAmount;
    const goal = matchingContract.goals.slice(-1).pop().targetAmount;

    if (produced >= goal) {
        return 0;
    }

    const remainingTime = coopStatus.secondsRemaining;
    return (goal - produced) / remainingTime * 3600;
}

exports.calculateTimeToCompletion = (coopStatus, matchingContract) => {
    const produced = coopStatus.totalAmount;
    const goal = matchingContract.goals.slice(-1).pop().targetAmount;

    if (produced >= goal) {
        return 0;
    }

    const eggsPerSecond = calculateEggsPerHour(coopStatus) / 3600;
    return (goal - produced) / eggsPerSecond;
}

exports.secondsToDateString = (seconds) => {
    if (seconds < 0) {
        seconds = 0;
    }
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);

    return `${days}d${hours}h${minutes}m`;
}

exports.getProgressBar = (eggsShipped, finalGoal) => {
    const progressBarLength = 40;
    const progress = Math.min(eggsShipped / finalGoal, 1);

    const hash = Math.round(progress * progressBarLength);
    const dash = progressBarLength - hash;
    return `[${"#".repeat(hash)}${"-".repeat(dash)}] ${Math.round(progress * 100)}%`;
}

exports.convertMilliseconds = (milliseconds) => {
    const total_seconds = Math.floor(milliseconds / 1000);
    const total_minutes = Math.floor(total_seconds / 60);
    const total_hours = Math.floor(total_minutes / 60);
    const days = Math.floor(total_hours / 24);

    const seconds = total_seconds % 60;
    const minutes = total_minutes % 60;
    const hours = total_hours % 24;

    return `${days}, ${hours}:${minutes}:${seconds}`;
};
