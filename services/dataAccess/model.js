const mongoose = require("mongoose");

const memberSchema = mongoose.Schema({
    eiId: {type: String, unique: true},
    discordId: {type: String, unique: true},
    inGameName: String,
})

const Member = mongoose.model("Member", memberSchema);

exports.Member = Member;
