const mongoose = require("mongoose");
const {Member} = require("./models.js");

const openDatabaseConnection = async () => {
    // set up the connection to the database and return it
    const CONNECTION_URL = "mongodb+srv://ray:ray1234@cluster0.onhgt.mongodb.net/discord_bot?retryWrites=true&w=majority";
    return await mongoose.connect(CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });
}

exports.addMember = async (eiId, discordId, inGameName) => {
    const newMember = new Member({eiId, discordId, inGameName});

    await openDatabaseConnection();
    await newMember.save();
    await mongoose.disconnect();
}

exports.removeMember = async (eiId, discordId, inGameName) => {
    await openDatabaseConnection();
    const member = await Member.findOneAndRemove({$or: [{eiId}, {discordId}, {inGameName}]});
    await mongoose.disconnect();
    return member;
}

exports.getMembers = async () => {
    await openDatabaseConnection();
    const members = await Member.find({});
    await mongoose.disconnect();
    return members;
}
