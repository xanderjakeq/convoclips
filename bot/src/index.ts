import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
dotenv.config();

// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

export type BotEvent = {
    name: string,
    once?: boolean,
    execute: (...args: any[]) => void
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//TODO: fix types
//@ts-ignore
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {

        //@ts-ignore TODO
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event: BotEvent = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

