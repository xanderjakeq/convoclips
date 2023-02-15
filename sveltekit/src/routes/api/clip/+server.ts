import type { RequestHandler } from './$types';

import { Prisma, PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const GET = (async ({}) => {
	const clips = await prisma.clip.findMany({
		include: {
			messages: true
		}
	});

	return json({ clips });
}) satisfies RequestHandler;

export const POST = (async ({ request }) => {
	const { name, messages } = await request.json();

	await prisma.clip.create({
		data: {
			name,
			messages: {
				create: messages
			}
		}
	});

	return json({ message: 'created clip' });
}) satisfies RequestHandler;
