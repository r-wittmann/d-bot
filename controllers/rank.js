const {formatEIValue} = require("../services/auxbrain/units.js");
const {getRankingByTypeMessage} = require("../messageGenerators/rankingMessage.js");
const {getPlayerByEiId} = require("../services/auxbrain/player.js");
const {getMembers} = require("../services/dataAccess/database.js");

exports.generateRanking = async (message, type) => {
    if (type) type = type.toUpperCase();
    // if type doesn't match, return
    if (!["EB", "SE", "PE", "GE", "GET", "D", "TC"].includes(type)) {
        await message.channel.send("Type needs to be one of 'EB' (earnings bonus), 'SE' (soul eggs), 'PE' (eggs of prophecy), 'GE' (golden eggs current), 'GET' (golden eggs total) or 'D' (drones).\nType needs to be included in the command.");
        return;
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
                inGameName: player.backup.userName,
                SE: parseInt(player.backup.game.soulEggsD),
                PE: parseInt(player.backup.game.eggsOfProphecy),
                EB: 100 * parseInt(player.backup.game.soulEggsD) * 1.5 * 1.1 ** parseInt(player.backup.game.eggsOfProphecy),
                GE: parseInt(player.backup.game.goldenEggsEarned) - parseInt(player.backup.game.goldenEggsSpent),
                GET: parseInt(player.backup.game.goldenEggsEarned),
                D: parseInt(player.backup.stats.droneTakedowns) + parseInt(player.backup.stats.droneTakedownsElite),
                TC: parseInt(player.backup.game.totalTimeCheatsDetected)
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
}
