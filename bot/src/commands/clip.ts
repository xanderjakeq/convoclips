import { ForumChannel, MessageComponentInteraction } from "discord.js";
import { SlashCommandBuilder, ThreadChannel } from "discord.js";

import {
	hasPermission,
	isServerRegistered,
	registerServer,
	postClip,
} from "../lib/utils";
import { serverSchema, clipSchema, messageSchema } from "../lib/z";

export const data = new SlashCommandBuilder()
	.setName("clip")
	.setDescription("Clip a conversation!");
export const execute = async function (
	interaction: MessageComponentInteraction,
) {
	if (!hasPermission(interaction.member)) {
		interaction.reply("No permission to clip.");
		return;
	}

	const reply = await interaction.reply({
		content: "Clipping...",
		fetchReply: true,
	});
	const channel = reply.channel;

	const isThread = channel instanceof ThreadChannel;

	if (isThread) {
		const guildId = channel.guildId;

		const guild = await interaction.guild?.fetch();

		let server = await isServerRegistered(guildId);

		//TODO: check if server exists
		//do some more stuff later
		if (guild && !server) {
			//should registration be required?
			//maybe add it, with defaults, then owner can customize later
			await reply.edit("server not found on convoclips.com... creating...");

			const { id: dc_guildId, name, ownerId } = guild;

			server = await registerServer(
				serverSchema.parse({ dc_guildId, name, ownerId }),
			);
			await reply.edit("server created");
		}

		const name = channel.name;
		const messages = await channel.messages.fetch();
		let availableTags: ForumChannel["availableTags"];
		let tags: string[] = [];

		if (channel.parentId) {
			const parent = await interaction.client.channels.fetch(channel.parentId);
			if (parent instanceof ForumChannel) {
				availableTags = parent.availableTags;
				tags = channel.appliedTags
					.map((tagId) => {
						const tag = availableTags.find((tag) => tag.id === tagId);
						return tag?.name;
					})
					.filter((tag) => tag != undefined) as string[];
			}
		}

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

		try {
			if (!server) {
				throw new Error("missing server");
			}

			const res = await postClip(
				clipSchema.parse({
					name,
					dc_threadId: channel.id,
					messages: strippedMessages,
					dc_serverId: server.id,
					tags,
				}),
			);

			if (res.status === 200) {
				reply.edit("Clipped.");
				reply.react("🐩");
			} else if (res.status === 400) {
				throw new Error("duplicate clip");
			} else {
				throw new Error("something went wrong");
			}
		} catch (e) {
			if ((e as Error).message === "duplicate clip") {
				reply.edit("Duplicate clip...");
			} else {
				reply.edit("Clip failed...");
			}
			reply.react("❌");
			console.log(e);
		}
	}
};

