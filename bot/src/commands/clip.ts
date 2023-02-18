import {
	ChatInputCommandInteraction,
	ForumChannel,
} from "discord.js";
import { SlashCommandBuilder, ThreadChannel } from "discord.js";

import {
	hasPermission,
	isServerRegistered,
	registerServer,
	postClip,
	ROLE,
} from "../lib/utils";
import { serverSchema, clipSchema, messageSchema } from "../lib/z";

export const data = new SlashCommandBuilder()
	.setName("clip")
	.setDescription("Clip a conversation!");
export const execute = async function (
	interaction: ChatInputCommandInteraction,
) {
	if (!hasPermission(interaction.member)) {
		interaction.reply(`No permission to clip. Must have ${ROLE} role.`);
		return;
	}

	const reply = await interaction.reply({
		content: "Clipping...",
		fetchReply: true,
	});
	const channel = reply.channel;

	const isThread = channel instanceof ThreadChannel;

	if (isThread && channel.parentId) {
		const guildId = channel.guildId;

		const guild = await interaction.guild?.fetch();

		let server = await isServerRegistered(guildId);

		if (guild && !server) {
			await reply.edit("Server not found on convoclips.com... creating...");

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

				return messageSchema.partial({ id: true }).parse(strippedMessage);
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

			reply.edit("Clipped.");
			reply.react("🐩");

			//TODO improve error handling with accurate messages
		} catch (e) {
			if ((e as Error).message?.includes("Unique")) {
				reply.edit("Duplicate clip...");
			} else {
				reply.edit("Clip failed...");
			}
			reply.react("❌");
			console.log(e);
		}
	} else {
		reply.edit("Sorry I only clip threads.");
		reply.react("i�");
	}
};

