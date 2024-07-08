import { parseCall, type CompleteBookingPortalRequest } from '$lib/parse-server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ fetch, request }) => {
	const req = (await request.json()) as CompleteBookingPortalRequest;
	const { data, error } = await parseCall(fetch, 'portal-complete-booking', req);

	return json({ data, error });
};
