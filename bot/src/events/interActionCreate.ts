import type { Interaction } from "discord.js";
import type { BotEvent } from "../index";
import { Events } from "discord.js";

export = {
	name: Events.InteractionCreate,

	execute: async function (interaction: Interaction) {
		if (!interaction.isChatInputCommand()) return;

		//@ts-ignore TODO
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
} as BotEvent;

