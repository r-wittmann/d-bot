exports.getEiIdMissMatchMessage = (eiId) => {
    return `There seems to be something wrong with your EI-Id. Generally an 'EI' at the beginning followed by 16 integers.\nYou submitted: ${eiId}`;
}
