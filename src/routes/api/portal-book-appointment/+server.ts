import { parseCall, type BookAppointmentPortalRequest } from '$lib/parse-server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const req = (await request.json()) as BookAppointmentPortalRequest;

	const { data, error } = await parseCall(fetch, 'portal-book-appointment', req);

	return json({ data, error });
};
