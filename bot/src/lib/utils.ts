import {
	GuildMemberRoleManager,
	MessageComponentInteraction,
} from "discord.js";
import { z } from "zod";

import { serverSchema } from "./z";
import { DC_Server, Clip } from "./types";

const API_BASE_URL = process.env.DEV
	? "http://localhost:5173/api"
	: process.env.API_BASE_URL;

const ROLE = "convoclipper";

export function hasPermission(
	member: MessageComponentInteraction["member"],
): boolean {
	const roles = member?.roles;

	if (!roles) {
		return false;
	}

	if (roles instanceof GuildMemberRoleManager) {
		return roles.cache.some((role) => role.name === ROLE);
	}

	return roles.some((role) => role === ROLE);
}

export async function isServerRegistered(
	guildId: string,
): Promise<undefined | DC_Server> {
	const server = await fetch(`${API_BASE_URL}/server?dc_guildId=${guildId}`);
	if (server.status === 404) {
		return undefined;
	}

	return await server.json();
}

export async function registerServer(
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

export async function postClip(clipData: Omit<Clip, "id">): Promise<Response> {
	return await fetch(`${API_BASE_URL}/clip`, {
		method: "post",
		body: JSON.stringify(clipData),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

