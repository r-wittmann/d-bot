const fs = require("fs");
const Discord = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
    if (!command) return;

    if (command.name === "help") {
        command.execute(message, client.commands);
    } else {
        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
});

client.login(token);