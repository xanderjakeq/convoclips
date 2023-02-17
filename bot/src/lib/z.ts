import { z } from "zod";

//I need z schemas in one place shared between bot and sveltekit

export const websiteSchema = z.string().url();

export const serverSchema = z.object({
	dc_guildId: z.string(),
	name: z.string(),
	website: websiteSchema.optional(),
	ownerId: z.string(),
});

export const messageSchema = z.object({
	author: z.string(),
	content: z.string(),
});

export const clipSchema = z.object({
	name: z.string(),
	dc_threadId: z.string(),
	dc_serverId: z.number().int(),
	messages: z.array(z.object({}).merge(messageSchema)),
	tags: z.array(z.string()),
});

