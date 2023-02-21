import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load = async function ({ fetch }) {
    try {
        const res = await fetch('/api/clip');
        return await res.json();
    } catch (e) {
        console.log(e);
        error(500, 'something went wrong.');
    }
} satisfies PageServerLoad;
