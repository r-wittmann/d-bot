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

/*
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

exports.getChannelNameByContractNameAndCoopCode = (contractName, coopCode) => {
    // remove all special characters and replace spaces with a hyphen (thats what discord does on channel creation
    return `${coopCode}-${contractName.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s/g, "-")}`;
}
*/
