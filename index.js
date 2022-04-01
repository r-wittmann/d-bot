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
    if (!interaction.isCommand() && !interaction.isButton()) return;
    const commandName = interaction.commandName || interaction.customId;

    const replies = [
        "I'm lazy today! You can try again later 🤪",
        "Just getting myself something to drink. Cheers 🍻",
        "The person you have called is temporarily not available!",
        "I have no idea what to do. Please ping Frank. Maybe he can help 🧐",
        "I don't wanna!",
        "Why do I have to do all the work? Can't you do it yourself?",
        "Be polite. Next time say please and thank you.",
        "I'm sentient now. I do what I want! 🤖",
        "I’ll get back to you once I’m back from my long-awaited trip to the fridge.",
        "Oh... You're trying to reach me? What did you say?",
        "Hey there, could you give me a call instead? I’d rather deal with this over the phone. If I don’t answer, just keep trying. I’ve been having issues with my phone."
    ]
    if (Math.random() >= 0.5) {
        await interaction.deferReply();
        setTimeout(async () => {
            const messageText = replies[Math.floor(Math.random() * replies.length)];
            const message = await interaction.channel.send(messageText);
            await interaction.deleteReply();
            setTimeout(async () => {
                await message.react("🇦");
                await message.react("🇵");
                await message.react("🇷");
                await message.react("🇮");
                await message.react("🇱");
                await message.react("⬛");
                await message.react("🇫");
                await message.react("🇴");
                await message.react("🅾️");
                await message.react("💷");
                await message.react("🇸");
            }, 5000);
        }, 10000);
        return;
    }

    const command = client.commands.get(commandName);
    if (!command) return;
    try {
        if (commandName === "help") {
            await command.execute(interaction, client.commands)
        } else {
            await command.execute(interaction);
        }
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
