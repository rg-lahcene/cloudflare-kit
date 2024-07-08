import { PARSE_APPLICATION_ID, PARSE_SERVER_URL } from '$env/static/private';
import type { Appointment, AppointmentType, User } from '$lib/types';
import type { PaymentIntentResult } from '@stripe/stripe-js';

export type ParseEndpoint =
	| 'portal-book-appointment'
	| 'portal-cancel-booking'
	| 'portal-complete-booking'
	| 'portal-get-booking-data'
	| 'portal-get-booking-from-hash'
	| 'portal-list-available-slots';

export type PoralRequests =
	| ListAvailableAppointmentSlotsRequest
	| BookAppointmentPortalRequest
	| CancelBookingPortalRequest
	| CompleteBookingPortalRequest
	| GetBookingDataPortalRequest
	| GetBookingFromHashPortalRequest;
export type PoralResponses =
	| ListAvailableAppointmentSlotsResponse
	| BookAppointmentPortalResponse
	| CancelBookingPortalResponse
	| CompleteBookingPortalResponse
	| GetBookingDataPortalResponse
	| GetBookingFromHashPortalResponse;

// portal requests
export type BookAppointmentPortalRequest = {
	hash: string;
	appointmentTypeId: string;
	startDate: string;
	endDate: string;
	timeZone: string;
	email: string;
	name: string;
	phoneNumber: {
		countryCode: string;
		dialCode: string;
		e164Number: string;
		internationalNumber: string;
		nationalNumber: string;
		number: string;
	};
};
export type ListAvailableAppointmentSlotsRequest = {
	hash: string | null; // use hash if called from portal , hash contains encrypted userId and domain
	startDate: string;
	endDate: string;
	appointmentTypeId: string;
	userTimeZone: string;
};
export type ListAvailableAppointmentSlotsResponse = {
	date: string;
	timeZone: string;
	slots: {
		from: string;
		to: string;
		fromLocal: string;
		toLocal: string;
	}[];
}[];

export type CancelBookingPortalRequest = { hash: string };
export type CompleteBookingPortalRequest = {
	clientId: string;
	appointmentId: string;
	paymentIntentId: string;
	hash: string;
};
export type GetBookingDataPortalRequest = { hash: string };
export type GetBookingFromHashPortalRequest = { hash: string };

// portal responses

export type BookAppointmentPortalResponse = {
	clientId: string;
	appointmentId: string;
	paymentIntent: PaymentIntentResult['paymentIntent'];
};
export type CancelBookingPortalResponse = {
	message: string;
	errors: unknown;
};
export type CompleteBookingPortalResponse = { message: string };
export type GetBookingDataPortalResponse = {
	appointmentTypes: AppointmentType[];
	user: User;
	hash: string;
	portalStyles: {
		styleMap: any;
		css: string;
		logo: string;
	};
	stripe: {
		publicKey: string;
		currency: string;
	};
};
export type GetBookingFromHashPortalResponse = Appointment;

// resolver
export type ParseRequestResolver<TEndpoint extends ParseEndpoint> =
	// portal
	TEndpoint extends 'portal-book-appointment'
		? BookAppointmentPortalRequest
		: TEndpoint extends 'portal-cancel-booking'
			? CancelBookingPortalRequest
			: TEndpoint extends 'portal-complete-booking'
				? CompleteBookingPortalRequest
				: TEndpoint extends 'portal-get-booking-data'
					? GetBookingDataPortalRequest
					: TEndpoint extends 'portal-get-booking-from-hash'
						? GetBookingFromHashPortalRequest
						: TEndpoint extends 'portal-list-available-slots'
							? ListAvailableAppointmentSlotsRequest
							: never;
export type ParseResponseResolver<TEndpoint extends ParseEndpoint> =
	TEndpoint extends 'portal-book-appointment'
		? BookAppointmentPortalResponse
		: TEndpoint extends 'portal-cancel-booking'
			? CancelBookingPortalResponse
			: TEndpoint extends 'portal-complete-booking'
				? CompleteBookingPortalResponse
				: TEndpoint extends 'portal-get-booking-data'
					? GetBookingDataPortalResponse
					: TEndpoint extends 'portal-get-booking-from-hash'
						? GetBookingFromHashPortalResponse
						: TEndpoint extends 'portal-list-available-slots'
							? ListAvailableAppointmentSlotsResponse
							: never;

export type ParseResponse<TData, TError = ParseError> =
	| { data: TData; error?: undefined }
	| { data?: undefined; error: TError };
export type ParsePromiseFunc = <TEndpoint extends ParseEndpoint>(
	fetch: any, // TODO fetch typing
	endpoint: TEndpoint,
	request?: ParseRequestResolver<TEndpoint>
) => Promise<ParseResponse<ParseResponseResolver<TEndpoint>>>;

export const getParseErrorMessage = (err: any, fallbackMessage = 'Unexpected error'): string => {
	if (!err) {
		return fallbackMessage;
	}
	if (typeof err === 'string') {
		return err;
	}

	if (err) {
		// is parse error
		if (err.error && 'code' in err.error && 'error' in err.error) {
			return err.error.error;
		}
	}
	if (err instanceof Error) {
		// mostly some dev related error, we just log it and show the generic error
		// return err.message;
		console.error(err);
	}

	return fallbackMessage;
};

class ParseError extends Error {
	public errorMessage: string;
	constructor(
		public endpoint: string,
		public status: number,
		public statusText: string,
		public message: string
	) {
		super(message);
		this.errorMessage = message;
	}
}

export const parseCall: ParsePromiseFunc = async (fetch, endpoint, request) => {
	const url = `${PARSE_SERVER_URL}/functions/${endpoint}`;
	console.log({ url, request });
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Parse-Application-Id': PARSE_APPLICATION_ID
			},
			body: JSON.stringify(request)
		});

		console.log({ response });
		if (!response.ok) {
			let errorMessage = 'Failed to fetch booking data, make sure you have a valid booking URL';
			// try extract parse error
			try {
				const error = await response.json();
				if (error && error.error && error.code) {
					errorMessage = error.error;
				}
			} catch (error) {
				console.log('not a parse error', { error });
			}
			throw new ParseError(endpoint, response.status, response.statusText, errorMessage);
		}
		const data = await response
			.clone()
			.json()
			.then((res: any) => res.result);
		return { data };
	} catch (error: any) {
		console.log('⛔ Fetch error: ', error);
		return { error };
	}
};
