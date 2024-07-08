import type { ClientFormSchema } from '$lib/booking-steps/client-details-form/schema';
import type { GetBookingDataPortalResponse } from '$lib/parse-server';
import type {
	AppointmentStartEndDate,
	AppointmentType,
	ClientDetails,
	ClientForm,
	Nullable,
	User
} from '$lib/types';
import { CURRENCY_SYMBOLS } from '$lib/utils';
import { getExternalImageUrl } from '$lib/utils/external-image.utils';
import { getUserTimeZone } from '$lib/utils/timezone';
import { writable, readonly, derived, get } from 'svelte/store';
import { queryParam } from 'sveltekit-search-params';
import type { ValidationErrors } from 'sveltekit-superforms';

// Types
const STEPS = [
	'select-appointment-type',
	'select-practitioner',
	'select-date-time',
	'fillin-client-details',
	'confirmation-and-payment'
] as const;
export type Step = (typeof STEPS)[number];
const STEP_TITLES: Record<Step, string> = {
	'select-appointment-type': 'Select an appointment type',
	'select-practitioner': 'About your practitioner',
	'select-date-time': 'Select date and time',
	'fillin-client-details': 'Fill-in your details',
	'confirmation-and-payment': 'Confirmation & Payment'
};

const DEFAULT_PRIMARY_COLOR = '#d97626';

export class ApplicationStore {
	// portal
	portalData?: GetBookingDataPortalResponse;
	timeZone = getUserTimeZone();
	currency = 'gbp'; // default ( will be updated once we get portal data on init)
	currencySymbol = '£';
	private _ui = writable<{ logo: string; primaryColor: string }>({
		logo: '',
		primaryColor: ''
	});
	public get ui() {
		return readonly(this._ui);
	}

	// user selection
	/** selected therapise, this will default to the user obtained in GetBookingDataPortalResponse */
	private _therapist = writable<Nullable<User>>(null);
	get therapist() {
		return readonly(this._therapist);
	}

	/** selected appointment type */
	private appointmentTypeIdParam = queryParam('appointmentTypeId');
	private _appointmentType = writable<Nullable<AppointmentType>>(null);
	get appointmentType() {
		return readonly(this._appointmentType);
	}

	/** selected appointment slot */
	private _appointmentDate = writable<AppointmentStartEndDate>({
		startDate: null,
		endDate: null
	});
	get appointmentDate() {
		return readonly(this._appointmentDate);
	}
	appointmentDateAndTime = derived(this.appointmentDate, ($appointmentDate) => {
		if (!$appointmentDate?.startDate) return '';
		const startDate = new Date($appointmentDate.startDate!);
		const currentLocal = Intl.DateTimeFormat().resolvedOptions().locale;
		return `${new Date(startDate).toLocaleDateString(currentLocal, { dateStyle: 'medium' })} ${new Date(startDate).toLocaleTimeString(currentLocal, { timeStyle: 'short' })}`;
	});

	/** selected appointment slot */
	defaultClientValues: ClientDetails = {
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: {
			countryCode: 'GB',
			isValid: false,
			phoneNumber: '',
			countryCallingCode: '44' as any,
			formattedNumber: '',
			nationalNumber: '',
			formatInternational: '',
			formatOriginal: '',
			formatNational: '',
			uri: '',
			e164: '' as any
		},
		confirmationItems: []
	};
	private _clientForm = writable<ClientForm>({
		data: this.defaultClientValues,
		errors: {},
		isValid: true
	});
	get clientForm() {
		return readonly(this._clientForm);
	}

	constructor() {}

	init(portalData: GetBookingDataPortalResponse) {
		if (!portalData) throw new Error('No portal data provided');
		this.portalData = portalData;
		// update store from query params
		const appointmentTypeId = get(this.appointmentTypeIdParam);
		if (appointmentTypeId) {
			const appointmentType = this.portalData?.appointmentTypes?.find(
				(e) => e.objectId === appointmentTypeId
			);
			if (appointmentType) {
				this.selectAppointmentType(appointmentType);
			}
		}
		if (portalData.portalStyles) {
			const logo = getExternalImageUrl(portalData.portalStyles.logo);
			const primaryColor = portalData.portalStyles.styleMap?.primary ?? DEFAULT_PRIMARY_COLOR;
			document.documentElement.style.cssText = `--primary: ${primaryColor}`;
			this._ui.set({ logo, primaryColor });
		}
		// TODO select time slot from query params, needs validation from backend.
		this.currency = portalData.stripe.currency;
		// @ts-ignore
		this.currencySymbol = CURRENCY_SYMBOLS[portalData.stripe.currency] ?? '£';
	}

	selectAppointmentType(appointmentType: AppointmentType) {
		if (get(this._appointmentType)?.objectId === appointmentType?.objectId) {
			return;
		}
		this._appointmentType.set(appointmentType);
		this.appointmentTypeIdParam.set(appointmentType.objectId);
		// invalidate  the selected slot
		this._appointmentDate.set({ startDate: null, endDate: null });
	}

	selectTherapist(therapist: User) {
		if (get(this._therapist)?.objectId === therapist.objectId) {
			return;
		}
		this._therapist.set(therapist);
		// invalidate  the selected slot
		this._appointmentDate.set({ startDate: null, endDate: null });
	}

	selectClientDetails(form: ClientForm) {
		this._clientForm.set(form);
	}

	selectAppointmentDate(startDate: Date, endDate: Date) {
		this._appointmentDate.set({ startDate, endDate });
	}

	// navigation
	currentStep = writable<Step>('select-appointment-type');
	next() {
		const currentIndex = STEPS.indexOf(get(this.currentStep));
		this.currentStep.set(STEPS[currentIndex + 1]);
	}
	previous() {
		const currentIndex = STEPS.indexOf(get(this.currentStep));
		this.currentStep.set(STEPS[currentIndex - 1]);
	}

	currentStepTitle = derived(this.currentStep, ($currentStep) => STEP_TITLES[$currentStep]);
	currentStepIndex = derived(this.currentStep, ($currentStep) => STEPS.indexOf($currentStep));
	canGoBack = derived(
		this.currentStep,
		($currentStep) => $currentStep !== 'select-appointment-type'
	);
	canGoNext = derived(
		[this.currentStep, this.appointmentType, this.appointmentDate, this.therapist, this.clientForm],
		([$currentStep, $appointmentType, $appointmentDate, $therapist, $client]) => {
			switch ($currentStep) {
				case 'select-appointment-type':
					return !!$appointmentType;
				case 'select-practitioner':
					return !!$therapist;
				case 'select-date-time':
					return !!$appointmentDate?.startDate && !!$appointmentDate?.endDate;
				case 'fillin-client-details':
					return $client.isValid;
				default:
					return false;
			}
		}
	);
}

export const store = new ApplicationStore();
