<script lang="ts">
	import { store } from '$lib/store';
	import { fly } from 'svelte/transition';
	import { loadStripe, type Stripe } from '@stripe/stripe-js';
	import { CardCvc, CardExpiry, CardNumber, Elements } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import { Button } from '$components/ui/button';
	import { cn, sleep } from '$lib/utils';
	import { goto } from '$app/navigation';
	import type { AppointmentType, Nullable } from '$lib/types';
	import type {
		BookAppointmentPortalRequest,
		BookAppointmentPortalResponse,
		CompleteBookingPortalResponse
	} from '$lib/parse-server';
	import BookingSummary from './booking-summary.svelte';
	// const
	const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };

	// public
	// store
	const {
		clientForm,
		appointmentDate,
		appointmentType,
		timeZone,
		portalData,
		currencySymbol,
		appointmentDateAndTime
	} = store;
	$: client = $clientForm.data;
	$: needsPayment = !isFreeAppointment($appointmentType);
	$: amountToPay = getAmountToPay($appointmentType);
	$: submitButtonText = !needsPayment
		? 'Confirm & Book'
		: `Confirm & Pay — ${currencySymbol}${amountToPay}`;

	$: {
		// reset the response if the appoitment type id or date changes
		if ($appointmentType?.objectId || $appointmentDateAndTime) {
			console.log('resetting response 🌍');
			bookAppointmentResponse = null;
		}
	}
	// TODO: move to store
	function isFreeAppointment(appointmentType: Nullable<AppointmentType>) {
		if (!appointmentType) return false;
		const isZeroDeposit = appointmentType.allowDeposit && appointmentType.deposit === 0;
		const isFreeBooking = appointmentType.price === 0;
		return isZeroDeposit || isFreeBooking;
	}

	function getAmountToPay(appointmentType: Nullable<AppointmentType>) {
		if (!appointmentType) return null;
		if (appointmentType.allowDeposit && appointmentType.deposit) {
			return appointmentType.deposit;
		}
		return appointmentType.price;
	}

	/** stripe */
	let stripe: Stripe | null = null;
	let cardElement: any;
	let isCardValid = false;
	let processing = false;
	let errorMessage = '';
	let progressText = '';
	// save the created appointment id when the user has failed payment
	let bookAppointmentResponse: BookAppointmentPortalResponse | null;
	onMount(async () => {
		if (!portalData?.stripe?.publicKey) {
			console.error('Stripe key is empty');
			return;
		}

		stripe = await loadStripe(portalData?.stripe.publicKey);
		setTimeout(() => {
			cardElement?.on('change', function (event: any) {
				if (event.error) {
					setError(event.error.message);
				} else {
					if (event.complete) {
						isCardValid = true;
						setError('');
					}
				}
			});
		}, 1000);
	});

	const classes = {
		base: 'h-14 w-full rounded-2xl border border-input   px-4 py-5 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2  bg-muted',
		focus: 'border-primary',
		complete: 'border-green-500 bg-green-50',
		empty: '',
		invalid: 'border-red-500 bg-red-50',
		webkitAutofill: ''
	};

	// submit function
	async function confirm() {
		try {
			if (processing || !isCardValid) return;
			// data validation
			if (
				!portalData?.hash ||
				!client?.email ||
				!client?.firstName ||
				!client?.lastName ||
				!client?.phoneNumber ||
				!$appointmentDate.startDate ||
				!$appointmentDate.endDate ||
				!$appointmentType
			) {
				setError('Form is invalid, fill all inputs and try again.');
				return;
			}

			processing = true;
			errorMessage = '';
			progressText = 'Booking appointment...';
			const clientEmail = $clientForm.data.email.toLowerCase().trim();
			if (!bookAppointmentResponse || !bookAppointmentResponse.appointmentId) {
				// 1- fetch to get payment intent
				const phone = client.phoneNumber;
				const { data, error } = (await fetch('/api/portal-book-appointment', {
					method: 'POST',
					headers,
					body: JSON.stringify({
						appointmentTypeId: $appointmentType.objectId,
						startDate: $appointmentDate.startDate.toISOString(),
						endDate: $appointmentDate.endDate.toISOString(),
						timeZone,
						email: client.email,
						name: `${client.firstName} ${client.lastName}`,
						hash: portalData.hash,
						// making sure the phone number object is formatted properly to be readable on the webapp
						phoneNumber: {
							countryCode: phone.countryCode,
							dialCode: `+${phone.countryCallingCode}`,
							e164Number: phone.e164,
							internationalNumber: phone.formatInternational,
							nationalNumber: phone.formatNational,
							number: phone.formatNational?.replaceAll(' ', '')
						}
					} as BookAppointmentPortalRequest)
				}).then((res) => res.json())) as { data: BookAppointmentPortalResponse } & {
					error: Error;
				};
				console.log({ error });
				if (error) {
					setError(
						'errorMessage' in error
							? (error.errorMessage as string)
							: 'Failed to book your appointment'
					);
					return;
				} else {
					bookAppointmentResponse = data;
				}
			}
			const { appointmentId, clientId, paymentIntent } = bookAppointmentResponse;
			// 2- confirm card payment
			if (paymentIntent?.client_secret && stripe) {
				progressText = 'Processing payment...';

				const confirmPaymentResult = await stripe.confirmCardPayment(paymentIntent.client_secret, {
					payment_method: {
						card: cardElement
					},
					receipt_email: clientEmail
				});
				console.log({ confirmPaymentResult });
				if (confirmPaymentResult.error) {
					setError(
						confirmPaymentResult.error.message ??
							'Payment error, please check your entered valid payment details!'
					);
					return;
				}
			}
			// 3- complete payment
			progressText = 'Finishing up...';
			const { data: completeBookingResponse, error: completeBookingError } = (await fetch(
				'/api/portal-complete-booking',
				{
					method: 'POST',
					headers,
					body: JSON.stringify({
						paymentIntentId: paymentIntent?.id ?? '',
						appointmentId,
						clientId,
						hash: portalData.hash
					})
				}
			).then((res) => res.json())) as { data: CompleteBookingPortalResponse } & {
				error: Error;
			};

			if (completeBookingError) {
				setError('Failed to complete your booking, please try again!');
				return;
			}
			// show success message
			progressText = 'Completed, redirecting...';
			processing = false;

			await sleep(2000);
			goto(`${portalData?.hash}/thanks`);
			// 4- redirect
		} catch (err) {
			console.error(err);
			setError('There was an error confirming the appointment, please try again.');
		}
	}

	function setError(error: string) {
		processing = false;
		errorMessage = error;
		progressText = '';
		console.log('setError', errorMessage);
	}
	$: console.log({ error: errorMessage });
</script>

<div in:fly={{ x: 20 }} class="flex flex-col items-center mt-8 max-w-xl m-auto gap-4">
	<BookingSummary />
	{#if stripe}
		<Elements {stripe}>
			<form on:submit|preventDefault={confirm} class=" flex flex-col items-center gap-4 w-full">
				<div class="grid md:grid-cols-2 grid-cols-1 gap-2 items-center w-full">
					<CardNumber bind:element={cardElement} {classes} />
					<div class="flex gap-2">
						<CardExpiry classes={{ ...classes, base: cn(classes.base, 'w-44 text-center') }} />
						<CardCvc classes={{ ...classes, base: cn(classes.base, 'w-32 text-center') }} />
					</div>
				</div>

				<Button
					on:click={confirm}
					variant="default"
					class="w-full max-w-md  m-auto"
					loading={processing}
				>
					{submitButtonText}
				</Button>

				{#if $appointmentType?.allowDeposit}
					<p class="text-muted-foreground font-medium text-sm my-2 text-center mt-3">
						You will be charged the deposit anount now and the outstanding balance will be paid
						after your appointment.
					</p>
				{/if}
				{#if progressText}
					{#key progressText}
						<p class="text-primary my-3 text-center" in:fly={{ y: -5 }}>
							{progressText}
						</p>
					{/key}
				{/if}
				{#if errorMessage}
					<p in:fly={{ x: -4 }} class="text-orange-600 text-center">
						{errorMessage}
					</p>
				{/if}
			</form>
		</Elements>
	{:else}
		Loading payment form...
	{/if}
</div>
