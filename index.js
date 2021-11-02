const fs = require("fs");
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {Client, Intents, Collection} = require('discord.js');

const dotenv = require("dotenv");

dotenv.config();

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;

const client = new Client({intents: [Intents.FLAGS.GUILDS]});
client.commands = new Collection();
const commands = [];

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        commands.push(command.data);
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log('Ready!');
    // Registering the commands in the client
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(token);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, guildId), {
                    body: commands
                },
            );
            console.log('Successfully registered application commands for development guild');
        } catch (error) {
            if (error) console.error(error);
        }
    })();
});

// setInterval(() => log(client, "$updateactivecoops"), 60000);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
