import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load = async function ({ params, fetch }) {
    try {
        const res = await fetch(`/api/clip?id=${params.id}`);

        return await res.json();
    } catch (e) {
        console.log(e);
        error(500, 'something went wrong.');
    }
} satisfies PageServerLoad;
