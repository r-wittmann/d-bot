const mongoose = require("mongoose");

const memberSchema = mongoose.Schema({
    eiId: {type: String, unique: true},
    discordId: {type: String, unique: true},
    inGameName: String,
    paused: {type: Boolean, default: false}
})
const Member = mongoose.model("Member", memberSchema);
exports.Member = Member;

const activeContractSchema = mongoose.Schema({
    contractId: {type: String, unique: true},
    activeCoops: [{
        coopCode: String,
        groupNumber: Number
    }]
})
const ActiveContract = mongoose.model("ActiveContract", activeContractSchema);
exports.ActiveContract = ActiveContract;
