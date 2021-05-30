exports.getActiveCoops = async (message) => {
    // get all messages from the "active-coop" channel
    let activeCoops = [];
    await message.client.channels.cache.get(process.env.ACTIVE_COOP_CHANNEL_ID).messages.fetch({limit:10})
        .then(messages => {
            messages.forEach(m => {
                const contractName = m.embeds[0].title;
                // the contract id is in brackets in the description
                const contractId = m.embeds[0].description.split("(").pop().split(")")[0];
                // the coopCodes are delimited by " in the fields names
                const coopCodes = m.embeds[0].fields.map(field => field.name.split('"')[1]);

                console.log(contractName, contractId, coopCodes);

                activeCoops.push({ m, contractName, contractId, coopCodes });
            })
        });
    return activeCoops;
}