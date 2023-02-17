import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load = async function ({ params, fetch }) {
	try {
		const serverPromise = fetch(`/api/server?id=${params.id}`);
		const clipsPromise = fetch(`/api/clip?dc_serverId=${params.id}`);

        const [server, clips] = await Promise.all([serverPromise, clipsPromise]);

		return  {
            server: await server.json(),
            clips: (await clips.json()).clips
        };
	} catch (e) {
		console.log(e);
		error(500, 'something went wrong.');
	}
} satisfies PageServerLoad;
