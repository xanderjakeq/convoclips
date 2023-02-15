import type { MessageComponentInteraction } from "discord.js";

import { SlashCommandBuilder, ThreadChannel } from "discord.js";
import { z } from "zod";

const messageSchema = z.object({
	author: z.string(),
	content: z.string(),
});

const API_BASE_URL = process.env.DEV
	? "http://localhost:5173/api"
	: process.env.API_BASE_URL;

export const data = new SlashCommandBuilder()
	.setName("clip")
	.setDescription("Clip a conversation!");
export const execute = async function (
	interaction: MessageComponentInteraction,
) {
	const reply = await interaction.reply({
		content: "Clipping!",
		fetchReply: true,
	});
	const channel = reply.channel;

	const isThread = channel instanceof ThreadChannel;

	if (isThread) {
		const name = channel.name;
		const messages = await channel.messages.fetch();

		const strippedMessages = messages
			.filter((message) => {
				return message.author.id != reply.author.id;
			})
			.reverse()
			.map((message) => {
				const strippedMessage = {
					author: message.author.username,
					content: message.content,
				};

				return messageSchema.parse(strippedMessage);
			});

		//TODO: zod this
		console.log(strippedMessages);

		try {
			await fetch(`${API_BASE_URL}/clip`, {
				method: "post",
				body: JSON.stringify({
					name,
					messages: strippedMessages,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			reply.edit("Clipped");
			reply.react("🐩");
		} catch (e) {
			reply.edit("Clip failed...");
			reply.react("❌");
		}
	}
};

