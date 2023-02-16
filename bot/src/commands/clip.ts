import {
	ForumChannel,
	GuildMemberRoleManager,
	MessageComponentInteraction,
} from "discord.js";

import { SlashCommandBuilder, ThreadChannel } from "discord.js";
import { z } from "zod";

const serverSchema = z.object({
	dc_guildId: z.string(),
	name: z.string(),
	website: z.string().optional(),
	ownerId: z.string(),
});

const messageSchema = z.object({
	author: z.string(),
	content: z.string(),
});

const clipSchema = z.object({
	name: z.string(),
	dc_threadId: z.string(),
	dc_serverId: z.number().int(),
	messages: z.array(z.object({}).merge(messageSchema)),
	tags: z.array(z.string()),
});

type DC_Server = z.infer<typeof serverSchema> & {
	id: number;
};

//I need z schemas in one place

const API_BASE_URL = process.env.DEV
	? "http://localhost:5173/api"
	: process.env.API_BASE_URL;

const ROLE = "convoclipper";

function hasPermission(member: MessageComponentInteraction["member"]): boolean {
	const roles = member?.roles;

	if (!roles) {
		return false;
	}

	if (roles instanceof GuildMemberRoleManager) {
		return roles.cache.some((role) => role.name === ROLE);
	}

	return roles.some((role) => role === ROLE);
}

async function isServerRegistered(
	guildId: string,
): Promise<undefined | DC_Server> {
	const server = await fetch(`${API_BASE_URL}/server?dc_guildId=${guildId}`);
	if (server.status === 404) {
		return undefined;
	}

	return await server.json();
}

async function registerServer(
	serverData: z.infer<typeof serverSchema>,
): Promise<DC_Server> {
	const server = await fetch(`${API_BASE_URL}/server`, {
		method: "POST",
		body: JSON.stringify(serverData),
		headers: {
			"Content-Type": "application/json",
		},
	});

	return await server.json();
}

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

			const res = await fetch(`${API_BASE_URL}/clip`, {
				method: "post",
				body: JSON.stringify(
					clipSchema.parse({
						name,
						dc_threadId: channel.id,
						messages: strippedMessages,
						dc_serverId: server.id,
						tags,
					}),
				),
				headers: {
					"Content-Type": "application/json",
				},
			});

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

