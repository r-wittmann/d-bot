const {getActiveCoops} = require("../controllers/activeCoop.js");
const {updateActiveCoops} = require("../controllers/activeCoop.js");


module.exports = {
    name: "updateactivecoops",
    usage: "",
    description: "Updates the active coops in the #active-coops channel.",
    async execute(client) {
        // get active coops from the #active-coop channel
        const activeCoops = await getActiveCoops(client);

        // update the active coops
        await updateActiveCoops(activeCoops);
    },
};
