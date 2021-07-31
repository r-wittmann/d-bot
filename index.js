const fs = require("fs");
const Discord = require("discord.js");
const dotenv = require("dotenv");
const {log} = require("./services/logService.js");

dotenv.config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
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

    commandHandler(message, command);
});

const commandHandler = async (message, command) => {
    await log(client, `Command \`${command.name}\` is about to be executed`);

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
}

client.login(token);