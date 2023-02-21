import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { z, ZodError } from 'zod';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

//TODO: make this shareable with bot
const userSchema = z.object({
    username: z.string(),
    email: z.string(),
    dc_id: z.string(),
    stripe_customer_id: z.string().optional(),
    subscribed: z.boolean().optional()
});

const userSearchParamsSchema = z.object({
    id: z.coerce.number().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    dc_id: z.string().optional()
});

export const GET = (async ({ url }) => {
    try {
        const keys = url.searchParams.keys();

        let dirtySearchParams: Record<string, any> = {};

        for (let key of keys) {
            dirtySearchParams[key] = url.searchParams.get(key);
        }

        const searchParams = userSearchParamsSchema.parse(dirtySearchParams);

        if (Object.keys(searchParams).length > 0) {
            const user = await prisma.user.findUnique({
                where: searchParams
            });

            return user ? json(user) : json({ message: 'not found' }, { status: 404 });
        } else {
            const users = await prisma.user.findMany({
                take: 100
            });

            return json({ users });
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
        const { username, email, dc_id, stripe_customer_id, subscribed } = userSchema.parse(data);

        const server = await prisma.user.create({
            data: {
                username,
                email,
                dc_id,
                stripe_customer_id,
                subscribed
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
