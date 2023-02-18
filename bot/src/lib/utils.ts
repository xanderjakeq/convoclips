import {
	GuildMemberRoleManager,
	MessageComponentInteraction,
} from "discord.js";
import { DC_Server, Clip } from "./types";
import { z } from "zod";
import https from "https";
import http from "http";

import { serverSchema, clipSchema } from "../lib/z";

const API_BASE_URL = process.env.DEV
	? "http://localhost:5173/api"
	: process.env.API_BASE_URL;

export const ROLE = "convoclipper";

export const fetch = process.env.DEV ? http : https;

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
	return new Promise((resolve, reject) => {
		fetch.get(`${API_BASE_URL}/server?dc_guildId=${guildId}`, (res) => {
			try {
				let data: Uint8Array[] = [];
				res.on("data", (chunk) => {
					data.push(chunk);
				});

				res.on("end", () => {
					const server: DC_Server = JSON.parse(Buffer.concat(data).toString());

					if (res.statusCode === 404) {
						return resolve(undefined);
					}

					resolve(serverSchema.and(z.object({ id: z.number() })).parse(server));
				});
			} catch (e) {
				reject(undefined);
			}
		});
	});
}

export async function registerServer(
	serverData: Omit<DC_Server, "id">,
): Promise<DC_Server> {
	const data = JSON.stringify(serverData);

	const newServerPromise = new Promise((resolve, reject) => {
		const req = fetch.request(
			`${API_BASE_URL}/server`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(data),
				},
			},
			(res) => {
				let resData: Uint8Array[] = [];

				res.on("data", (chunk) => {
					resData.push(chunk);
				});

				res.on("end", () => {
					let resJson: DC_Server = JSON.parse(
						Buffer.concat(resData).toString(),
					);

					if (res.statusCode != 200) {
						reject(resJson);
					}

					resolve(resJson);
				});
			},
		);

		req.on("error", (e) => {
			reject(e);
		});

		req.write(data);
		req.end();
	});

	const server = await newServerPromise;

	return z
		.object({
			server: serverSchema.and(z.object({ id: z.number() })),
		})
		.parse(server).server;
}

export async function updateServer(
	serverData: Partial<Omit<DC_Server, "id">> & Pick<DC_Server, "dc_guildId">,
): Promise<DC_Server> {
	const data = JSON.stringify(serverData);

	const updatePromise = new Promise((resolve, reject) => {
		const req = fetch.request(
			`${API_BASE_URL}/server`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(data),
				},
			},
			(res) => {
				let resData: Uint8Array[] = [];

				res.on("data", (chunk) => {
					resData.push(chunk);
				});

				res.on("end", () => {
					const resJson = JSON.parse(Buffer.concat(resData).toString());

					if (res.statusCode != 200) {
						reject(resJson);
					}

					resolve(resJson);
				});
			},
		);

		req.write(data);
		req.end();
	});

	const server = await updatePromise;

	return z
		.object({
			server: serverSchema.and(z.object({ id: z.number() })),
		})
		.parse(server).server;
}

export async function postClip(
	clipData: Omit<Clip, "id">,
): Promise<Omit<Clip, "messages" | "tags">> {
	const data = JSON.stringify(clipSchema.parse(clipData));

	return new Promise((resolve, reject) => {
		const req = fetch.request(
			`${API_BASE_URL}/clip`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(data),
				},
			},
			(res) => {
				let resData: Uint8Array[] = [];
				res.on("data", (chunk) => {
					resData.push(chunk);
				});

				res.on("end", () => {
					const resJson = JSON.parse(Buffer.concat(resData).toString());

					if (res.statusCode != 200) {
						reject(resJson);
						return;
					}

					resolve(
						clipSchema
							.merge(z.object({ id: z.number() }))
							.partial({ messages: true, tags: true })
							.parse(resJson.clip),
					);
				});
			},
		);

		req.on("error", (e) => {
			reject(e);
		});

		req.write(data);
		req.end();
	});
}

