import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { z, ZodError } from 'zod';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

//TODO: make this shareable with bot
const serverSchema = z.object({
    dc_guildId: z.string(),
    name: z.string(),
    website: z.string().optional(),
    ownerId: z.string()
});

const serverSearchParamsSchema = z.object({
    id: z.coerce.number().optional(),
    dc_guildId: z.string().optional(),
    ownerId: z.string().optional()
});

//TODO: implement some caching maybe
export const GET = (async ({ url }) => {
    try {
        const keys = url.searchParams.keys();

        let dirtySearchParams: Record<string, any> = {};

        for (let key of keys) {
            dirtySearchParams[key] = url.searchParams.get(key);
        }

        const searchParams = serverSearchParamsSchema.parse(dirtySearchParams);

        if (searchParams.id || searchParams.dc_guildId || searchParams.ownerId) {
            const server = await prisma.dC_Server.findUnique({
                where: searchParams
            });

            return server ? json(server) : json({ message: 'not found' }, { status: 404 });
        } else {
            const servers = await prisma.dC_Server.findMany({
                where: searchParams,
                take: 100
            });

            return json({ servers });
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
        const { name, dc_guildId, website, ownerId } = serverSchema.parse(data);

        const server = await prisma.dC_Server.create({
            data: {
                name,
                dc_guildId,
                website,
                ownerId
            }
        });

        return json({ message: 'created server', server });
    } catch (e) {
        console.log(e);

        if (e instanceof ZodError || e instanceof Prisma.PrismaClientKnownRequestError) {
            return json({ message: e.message }, { status: 400 });
        }

        return json({ message: 'something went wrong.' }, { status: 500 });
    }
}) satisfies RequestHandler;

export const PUT = (async ({ request }) => {
    const data = await request.json();

    try {
        const { name, dc_guildId, website, ownerId } = serverSchema
            .partial({ name: true, website: true, ownerId: true })
            .parse(data);

        const server = await prisma.dC_Server.update({
            where: {
                dc_guildId
            },
            data: {
                name,
                dc_guildId,
                website,
                ownerId
            }
        });

        return json({ message: 'updated server', server });
    } catch (e) {
        console.log(e);

        if (e instanceof ZodError || e instanceof Prisma.PrismaClientKnownRequestError) {
            return json({ message: e.message }, { status: 400 });
        }

        return json({ message: 'something went wrong.' }, { status: 500 });
    }
}) satisfies RequestHandler;
