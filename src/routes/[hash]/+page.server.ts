import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parseCall } from '$lib/parse-server';

export const load = (async ({ params, url, fetch }) => {
	const hash = params.hash;

	if (!hash || hash.length < 10) {
		redirect(307, '/invalid-request');
	}
	// fetch booking data
	const { data, error: fetchError } = await parseCall(fetch, 'portal-get-booking-data', {
		hash
	});

	if (fetchError) {
		error(fetchError.status, fetchError.message);
	}

	return { data: { ...data, hash } };
}) satisfies PageServerLoad;
