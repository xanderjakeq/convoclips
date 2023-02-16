import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { z, ZodError } from 'zod';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

const messageSchema = z.object({
	author: z.string(),
	content: z.string()
});

//TODO: make this shareable with bot
const clipSchema = z.object({
	name: z.string(),
	dc_threadId: z.string(),
	dc_serverId: z.number().int(),
	messages: z.array(z.object({}).merge(messageSchema)),
	tags: z.array(z.string()).optional()
});

const clipSearchParamsSchema = z.object({
	id: z.coerce.number().optional(),
	dc_threadId: z.string().optional()
});

export const GET = (async ({ url }) => {
	try {
		const keys = url.searchParams.keys();

		let dirtySearchParams: Record<string, any> = {};

		for (let key of keys) {
			dirtySearchParams[key] = url.searchParams.get(key);
		}

		const searchParams = clipSearchParamsSchema.parse(dirtySearchParams);

		if (Object.keys(searchParams).length > 0) {
			const clips = await prisma.clip.findUnique({
				where: searchParams,
				include: {
					messages: true
				}
			});

			return clips ? json({ clips }) : json({ message: 'not found' }, { status: 404 });
		} else {
			const clips = await prisma.clip.findMany({
				include: {
					messages: true
				},
				take: 100
			});

			return json({ clips });
		}
	} catch (e) {
		console.log(e);

		if (e instanceof ZodError || e instanceof Prisma.PrismaClientKnownRequestError) {
			return json({ message: e.message }, { status: 400 });
		}

		return json(
			{ message: 'something went wrong' },
			{
				status: 500
			}
		);
	}
}) satisfies RequestHandler;

export const POST = (async ({ request }) => {
	const data = await request.json();

	try {
		const { name, dc_serverId, dc_threadId, messages, tags = [] } = clipSchema.parse(data);

		const clip = await prisma.clip.create({
			data: {
				name,
				dc_threadId,
				dc_serverId,
				messages: {
					create: messages
				}
			}
		});

		for (let i = 0; i < tags.length; i++) {
			const tag = await prisma.tag.upsert({
				create: {
					name: tags[i]
				},
				update: {},
				where: {
					name: tags[i]
				}
			});

			await prisma.clip_Tag.create({
				data: {
					clipId: clip.id,
					tagId: tag.id
				}
			});
		}

		return json({ message: 'created clip', clip });
	} catch (e) {
		console.log(e);

		if (e instanceof ZodError || e instanceof Prisma.PrismaClientKnownRequestError) {
			return json({ message: e.message }, { status: 400 });
		}

		return json({ message: 'something went wrong.' }, { status: 500 });
	}
}) satisfies RequestHandler;
