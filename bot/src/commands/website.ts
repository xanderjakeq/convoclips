import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	ForumChannel,
	GuildMemberRoleManager,
	MessageComponentInteraction,
} from "discord.js";
import { SlashCommandBuilder, ThreadChannel } from "discord.js";
import { ZodError } from "zod";

import { hasPermission, updateServer } from "../lib/utils";
import {
	serverSchema,
	clipSchema,
	messageSchema,
	websiteSchema,
} from "../lib/z";

export const data = new SlashCommandBuilder()
	.setName("website")
	.setDescription("Update website for the server.")
	.addStringOption((option) => {
		return option
			.setName("url")
			.setDescription("website link for the server page")
			.setMaxLength(2000)
			.setRequired(true);
	});
export const execute = async function (interaction: CommandInteraction) {
	if (!hasPermission(interaction.member)) {
		interaction.reply("No permission to clip.");
		return;
	}

	try {
		const url = websiteSchema.parse(interaction.options.get("url")?.value);

		if (!interaction.guildId) {
			throw new Error("missing guildId");
		}

		const updatePromise = updateServer({
			website: url,
			dc_guildId: interaction.guildId,
		});

		const reply = await interaction.reply({
			content: "Upating...",
			fetchReply: true,
		});

		const server = await updatePromise;

		reply.edit(`Server updated https://convoclips.com/${server.dc_guildId}`);
	} catch (e) {
		if (e instanceof ZodError) {
			interaction.reply((e as ZodError).errors[0].message);
		}

		console.log(e);
	}
};

