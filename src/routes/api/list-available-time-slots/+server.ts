import { parseCall } from '$lib/parse-server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, fetch }) => {
	const req = await request.json();
	const { data, error } = await parseCall(fetch, 'portal-list-available-slots', req);
	return json({ data, error });
};
