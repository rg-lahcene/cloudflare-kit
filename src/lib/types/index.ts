import type { ClientFormSchema } from '$lib/booking-steps/client-details-form/schema';
import { CalendarDate } from '@internationalized/date';
import type { CountryCode, DetailedValue } from 'svelte-tel-input/types';
import type { ValidationErrors } from 'sveltekit-superforms';
export type Nullable<T> = T | null;

export type AppointentResponse = {
	businessLocations: BusinessLocation[];
	stripePublicKey?: string; // optional, we can have free appointments scheduled
	portalStyles: PortalStyles;
};

export type BusinessLocation = {
	id: string;
	name: string;
	logo: string;
	address: {
		country: string;
		address: string;
		city: string;
		postalCode: string;
	};
	website: string;
	phone: string;

	confirmationItems: string[];
	appointmentTypes: AppointmentType[];
};
export type AppointmentType = {
	objectId: string;
	name: string;
	duration: number;
	meetingType: string;
	gap: number;
	price: number;
	showInPortal: boolean;
	allowDeposit: boolean;
	deposit: number;
	refundableDeposit: boolean;
	description: string;
	userId: string;
	color?: string;
};

export type PersonalDetails = {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
};

export type AppointmentDate = {
	date: CalendarDate;
	selectedSlot: Date | null;
	timezone: string | null;
};

export type AppointmentStartEndDate = {
	startDate: Nullable<Date>;
	endDate: Nullable<Date>;
};

export type PortalStyles = {
	css: string;
	logo: string;
	styleMap: {
		headerBackground: string;
		titleColor: string;
		accent: string;
		textColor: string;
		primary: string;
	};
};

export interface Appointment {
	objectId: string;
	userId: string;
	clientId: string;
	user: User;
	client: { objectId: string; name: string };
	appointmentType: AppointmentType;
	startDate: string | Date;
	endDate: string | Date;
	canceled: boolean;
	timeZone: string;
	chargeId?: string;
	refundId?: string;
	createdAt: Date;
	updatedAt?: Date;

	/**
	 * meetingId defined for teleahealth appointments, if it is defined then this means this is a telehealth meeting
	 */
	meetingId?: string;
	meetingJoinUrl?: string;
	meetingStartUrl?: string;
	meetingAttended?: boolean;
	meetingCompleted?: boolean;
	meetingCompletedAt?: Date;
	clientTimeZoneOffset?: number;
	/**
	 * if true, it means this is  a custom appointment that does not necessarily adhere to the availability
	 * based on appointment rules and exceptions..etc.
	 */
	isCustom?: boolean;
}

export interface User {
	objectId: string;
	username: string; // same as email, this is a Parse thing
	firstName: string;
	lastName: string;
	name?: string;
	email: string;
	avatar?: string;
	biography?: string;
}

export type IntlPhoneNumber = {
	countryCode: CountryCode | null | undefined;
	dialCode: string;
	e164Number: string;
	internationalNumber: string;
	nationalNumber: string;
	number: string;
};
export interface ClientDetails {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: DetailedValue;
	confirmationItems: string[];
}
export type ClientForm = {
	data: ClientDetails;
	isValid: boolean;
	errors: ValidationErrors<ClientFormSchema>;
};
