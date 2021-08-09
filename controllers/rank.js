const {log} = require("../services/logService.js");
const {calculateEarningsBonus} = require("../services/utils.js");
const {getPlayerByEiId} = require("../services/dataAccess/auxbrainApi.js");
const {formatEIValue} = require("../services/auxbrain/units.js");
const {getRankingByTypeMessage} = require("../messageGenerators/rankMessage.js");
const {getMembers} = require("../services/dataAccess/database.js");

exports.generateRanking = async (message, type) => {
    if (type) type = type.toUpperCase();
    // if type doesn't match, return
    if (!["EB", "SE", "PE", "GE", "GET", "D"].includes(type)) {
        throw new Error("Type needs to be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total) or 'D' (drones).\nType needs to be included in the command.")
    }

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
                SE: parseInt(player.backup.game.soulEggsD),
                PE: parseInt(player.backup.game.eggsOfProphecy),
                EB: calculateEarningsBonus(player.backup),
                GE: parseInt(player.backup.game.goldenEggsEarned) - parseInt(player.backup.game.goldenEggsSpent),
                GET: parseInt(player.backup.game.goldenEggsEarned),
                D: parseInt(player.backup.stats.droneTakedowns) + parseInt(player.backup.stats.droneTakedownsElite),
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
    await message.channel.send({embed: getRankingByTypeMessage(updatedMembers, type)});
    await log(message.client, "Command `rank` completed.");
}
