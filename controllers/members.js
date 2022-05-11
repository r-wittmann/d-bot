const {MessageAttachment} = require("discord.js");
const {getMemberListMessage} = require("../messageGenerators/membersListMessage.js");
const {getDiscordName} = require("../services/dataAccess/discord.js");
const {addMember, removeMember, getMembers, pauseMember} = require("../services/dataAccess/database.js");
const {getPlayerByEiId, getCoopStatus} = require("../services/dataAccess/auxbrainApi.js");

exports.addMember = async (interaction, eiId, inGameName, discordUser) => {
    // check the ei id for a match to the general pattern
    if (!/^(EI)([0-9]{16})/.test(eiId)) {
        throw new Error(`The provided EI-id seems to be wrong. It is generally formatted as EI + 16 numbers. You provided \`${eiId}\``);
    }

    try {
        await addMember(eiId, discordUser.id, inGameName);
        await interaction.editReply({content: "Member added successfully"});
    } catch (e) {
        throw e;
    }
}

exports.pauseMember = async (interaction, eiId, inGameName, discordId) => {
    if (eiId === "" && inGameName === "" && discordId === "") {
        throw new Error("At least one parameter is required for this command");
    }

    try {
        const member = await pauseMember(eiId, discordId, inGameName);
        if (!member) throw new Error(`User not found. Provided parameters: egg-inc-id\`${eiId}\`, in-game-name\`${inGameName}\`, discord-user\`${discordId}\`,`);
        await interaction.editReply({content: `Membership of ${member.inGameName} was set to ${member.paused ? "paused": "active"}. A paused membership implies that the member is not assigned to coops during coop assignment.`})
    } catch (e) {
        throw e;
    }

}

exports.removeMember = async (interaction, eiId, inGameName, discordId) => {
    if (eiId === "" && inGameName === "" && discordId === "") {
        throw new Error("At least one parameter is required for this command");
    }

    try {
        const member = await removeMember(eiId, discordId, inGameName);
        if (!member) throw new Error(`User not found. Provided parameters: egg-inc-id\`${eiId}\`, in-game-name\`${inGameName}\`, discord-user\`${discordId}\`,`);

        await interaction.editReply({content: "Member removed successfully"});
    } catch (e) {
        throw e;
    }
}

exports.getMembers = async (interaction) => {
    try {
        const members = await getMembers();

        // add discord user name or display name
        const membersWithDiscordNames = [];
        for (let member of members) {
            const discordName = await getDiscordName(interaction, member.discordId);
            const updatedMember = Object.assign({}, member.toObject(), {discordName});
            membersWithDiscordNames.push(updatedMember);
        }
        // sort members alphabetically
        membersWithDiscordNames.sort((a, b) => a.discordName.localeCompare(b.discordName));

        // too many members for one message...
        const chunkedList = [];
        for (let i = 0; i < membersWithDiscordNames.length; i += 10) {
            chunkedList.push(membersWithDiscordNames.slice(i, i + 10));
        }

        await interaction.channel.send(getMemberListMessage(chunkedList.shift(), 0))

        for (let i = 0; i < chunkedList.length; i++) {
            await interaction.channel.send(getMemberListMessage(chunkedList[i], i + 1))
        }

        await interaction.editReply({content: "Member List:"});
    } catch (e) {
        throw e;
    }
}

exports.getMemberEBHistory = async (interaction, discordUser) => {
    // get all members from database to extract correlating EI id
    const members = await getMembers();
    const member = members.find(m => m.discordId === discordUser.id)

    // get contracts archive from EI API
    const player = await getPlayerByEiId(member.eiId);
    const updatedMember = Object.assign({}, member.toObject(), {backup: player.backup});

    // extract all coop contracts from player backup and remove unneeded information
    const coopContracts = updatedMember.backup.contracts.archive
        .filter(contract => contract.coopIdentifier && contract.coopIdentifier !== "")
        .map(contract => {
            const startDate = new Date(contract.timeAccepted * 1000);
            return {
                contractId: contract.contract.identifier,
                coopCode: contract.coopIdentifier,
                startDate,
            }
        });

    // loop through all coops and get coop status from EI API
    const updatedCoopContracts = [];
    for (const contract of coopContracts) {
        const coopStatus = await getCoopStatus(contract.contractId, contract.coopCode);
        // if everyone left the coop, the contributors attribute is missing
        if (!coopStatus.contributors) continue;

        const player = coopStatus.contributors.find(contributor => contributor.userId === member.eiId);
        // if the player in question left the coop, they are no longer in the contributors list
        if (!player) continue;

        const soulPower = player.soulPower;
        const playerEB = Math.round(Math.pow(10, soulPower));
        updatedCoopContracts.push(Object.assign({}, contract, {playerEB}));
    }

    let returnText = "date,EB\n";
    updatedCoopContracts.forEach(contract => {
        returnText += `${contract.startDate.toISOString()},${BigInt(contract.playerEB).toString()}\n`
    })

    await interaction.editReply({
        content: `${member.inGameName}'s EB history:\n`,
        files: [
            new MessageAttachment(Buffer.from(returnText), `${member.inGameName}.txt`),
        ]
    })
}
