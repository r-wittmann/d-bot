const {calculateEarningsBonus, calculateContributionPotential} = require("../services/utils.js");
const {getPlayerByEiId, getAllContractsList} = require("../services/dataAccess/auxbrainApi.js");
const {formatEIValue} = require("../services/auxbrain/units.js");
const {getRankingByTypeMessage} = require("../messageGenerators/rankMessage.js");
const {getMembers} = require("../services/dataAccess/database.js");

exports.generateRanking = async (interaction, type) => {
    if (type) type = type.toUpperCase();
    // if type doesn't match, return
    if (!["EB", "SE", "PE", "GE", "GET", "D", "LEG", "CC"].includes(type)) {
        throw new Error("Type needs to be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total), 'D' (drones), 'LEG' (legendaries) or 'CC' (coop contribution).\nType needs to be included in the command.")
    }

    // get all members from the database
    const members = await getMembers();

    // get previous contracts
    let previousContracts = await getAllContractsList();
    previousContracts = previousContracts.slice(-13);
    previousContracts = previousContracts.map(contract => contract.id);

    // get player info from auxbrain API
    let updatedMembers = [];
    for (let member of members) {
        const player = await getPlayerByEiId(member.eiId);
        member = Object.assign(
            {},
            member.toObject(),
            {
                SE: parseInt(player.backup.game.soulEggsD),
                PE: parseInt(player.backup.game.eggsOfProphecy),
                EB: calculateEarningsBonus(player.backup),
                GE: parseInt(player.backup.game.goldenEggsEarned) - parseInt(player.backup.game.goldenEggsSpent),
                GET: parseInt(player.backup.game.goldenEggsEarned),
                D: parseInt(player.backup.stats.droneTakedowns),
                LEG: countLegendaries(player.backup),
                CC: calculateCoopContribution(player, previousContracts),
            });
        updatedMembers.push(member);
    }

    // sort members by the given type
    updatedMembers.sort((a, b) => b[type] - a[type]);

    // if type is SE or EB, transform to in game notation
    if (["SE", "EB"].includes(type)) {
        updatedMembers.map(member => {
            member[type] = formatEIValue(member[type]);
            return member;
        })
    }

    // send message
    await interaction.editReply({embeds: [getRankingByTypeMessage(updatedMembers, type)]});
}

const countLegendaries = (backup) => {
    let count = 0;
    for (const artifact of backup.artifactsDb.inventoryItems) {
        if (artifact.artifact.spec.rarity === 3) {
            count++;
        }
    }
    return count;
}

const calculateCoopContribution = (member, previousContracts) => {
    const updatedMember = calculateContributionPotential(member, previousContracts);
    return Math.round(updatedMember.contributionPotential * 100).toFixed(2);
}
