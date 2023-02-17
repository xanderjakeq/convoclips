import type { RequestHandler } from './$types';
import type { Message } from '$lib/types';

import { json } from '@sveltejs/kit';
import { z, ZodError } from 'zod';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { uniqueNamesGenerator, NumberDictionary, animals, colors } from 'unique-names-generator';
import { clipSchema } from '$lib/z';

const clipSearchParamsSchema = z.object({
	id: z.coerce.number().optional(),
	dc_threadId: z.string().optional()
});

type PartialMessage = Omit<Message, "id">

function anonymize(messages: PartialMessage[]): PartialMessage[] {
	let randomNames = new Map<string, string>();

	return messages.map((message) => {
		let randomName = randomNames.get(message.author);

		if (randomName) {
			message.author = randomName;
			return message;
		}
		const numberDictionary = NumberDictionary.generate({ min: 100, max: 9999 });
		randomName = uniqueNamesGenerator({
			dictionaries: [colors, animals, numberDictionary],
			style: 'lowerCase'
		});

		randomNames.set(message.author, randomName);

		message.author = randomName;
		return message;
	});
}

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

			return clips ? json(clips) : json({ message: 'not found' }, { status: 404 });
		} else {
			const clips = await prisma.clip.findMany({
				orderBy: [{ updatedAt: 'desc' }],
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

		const anonymousMessages = anonymize(messages);

		const clip = await prisma.clip.create({
			data: {
				name,
				dc_threadId,
				dc_serverId,
				messages: {
					create: anonymousMessages
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
