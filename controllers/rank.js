const {calculateEarningsBonus} = require("../services/utils.js");
const {getPlayerByEiId} = require("../services/dataAccess/auxbrainApi.js");
const {formatEIValue} = require("../services/auxbrain/units.js");
const {getRankingByTypeMessage, getRankingOverview} = require("../messageGenerators/rankMessage.js");
const {getMembers} = require("../services/dataAccess/database.js");

exports.generateRanking = async (interaction, type) => {
    const types = ["EB", "SE", "PE", "GE", "D", "LEG", "PRES"];

    // get all members from the database
    const members = await getMembers();

    // get player info from auxbrain API
    let updatedMembers = [];
    for (let member of members) {
        const player = await getPlayerByEiId(member.eiId);
        member = Object.assign(
            {},
            member.toObject(),
            {
                SE: {count: player.backup.game.soulEggsD},
                PE: {count: player.backup.game.eggsOfProphecy},
                EB: {count: calculateEarningsBonus(player.backup)},
                GE: {count: parseInt(player.backup.game.goldenEggsEarned)},
                D: {count: parseInt(player.backup.stats.droneTakedowns)},
                LEG: {count: countLegendaries(player.backup)},
                PRES: {count: player.backup.stats.numPrestiges},
            });
        updatedMembers.push(member);
    }

    if (type) {
        // sort members by the given type
        updatedMembers.sort((a, b) => b[type].count - a[type].count);

        // if type is SE, EB or GE, transform to in game notation
        if (["SE", "EB", "GE"].includes(type)) {
            updatedMembers.map(member => {
                member[type].count = formatEIValue(member[type].count);
                return member;
            })
        }

        // send message
        await interaction.editReply({embeds: [getRankingByTypeMessage(updatedMembers, type)]});
    } else {
        let requester = updatedMembers.find(member => member.discordId === interaction.user.id);

        types.forEach(t => {
            // sort members by the given type
            const ranking = updatedMembers.sort((a, b) => b[t].count - a[t].count);
            // add rank of that type to the requester object
            requester[t].rank = ranking.findIndex(m => m.eiId === requester.eiId) + 1;
            // if type is SE, EB or GE, transform to in game notation
            if (["SE", "EB", "GE"].includes(t)) {
                requester[t].count = formatEIValue(requester[t].count);
            }
        })

        // send message
        await interaction.editReply({embeds: [getRankingOverview(requester)]});
    }
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
