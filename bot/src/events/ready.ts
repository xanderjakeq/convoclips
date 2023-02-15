import type { Client } from "discord.js";
import type { BotEvent } from "../index";

import { Events } from "discord.js";

export = {
	name: Events.ClientReady,
	once: true,
	execute: function (client: Client) {
		console.log(`Ready! Logged in as ${client.user?.tag}`);
	},
} as BotEvent;

