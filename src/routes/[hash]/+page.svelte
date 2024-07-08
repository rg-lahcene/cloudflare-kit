<script lang="ts">
	import { onMount } from 'svelte';
	import { store } from '$lib/store';
	// prettier-ignore
	import { AppointmentTypeList, PractitionerList, Header, AppointmentsCalendar, ClientDetailsForm, PaymentForm} from '$lib/booking-steps';
	import DarkModeToggle from '$lib/components/ui/dark-mode-toggle/dark-mode-toggle.svelte';
	import { Button } from '$components/ui/button';
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';

	// page data
	export let data: PageData;
	$: ({ appointmentTypes, user, hash } = data.data);

	let { ui, currentStep, canGoBack, canGoNext } = store;
	let loading = true;
	onMount(() => {
		store.init(data.data);
		loading = false;
	});

	const animation = 'animate-in fade-in slide-in-from-left-4 duration-300';
</script>

{#if loading}
	<!-- animation overlay to avoid the flikkr begavior when changing primary color -->
	<div
		class="inset-0 absolute flex items-center justify-center bg-background w-screen h-screen z-50"
	>
		<div>
			<p class="text-muted-foreground text-2xl">Loading...</p>
		</div>
	</div>
{:else}
	<main in:fly={{ x: -10 }} class="md:p-6 p-4 h-full min-h-screen relative">
		<Header logo={$ui.logo} primaryColor={$ui.primaryColor} />
		<hr class="border-t mt-2 mb-8 border-muted" />
		<div class="pb-8">
			<div class={$currentStep === 'select-appointment-type' ? animation : 'hidden'}>
				<AppointmentTypeList appointemntTypes={appointmentTypes} />
			</div>
			<div class={$currentStep === 'select-practitioner' ? animation : 'hidden'}>
				<PractitionerList practitioners={[user]} />
			</div>
			<div class={$currentStep === 'select-date-time' ? animation : 'hidden'}>
				<AppointmentsCalendar {hash} />
			</div>
			<div class={$currentStep === 'fillin-client-details' ? animation : 'hidden'}>
				<ClientDetailsForm />
			</div>
			<div class={$currentStep === 'confirmation-and-payment' ? animation : 'hidden'}>
				<PaymentForm />
			</div>
		</div>

		<!-- <DarkModeToggle class=" fixed bottom-6 md:left-10 left:4" /> -->
		<div class="h-12 items-center flex justify-end gap-3 fixed bottom-4 md:right-10 right-6">
			<Button
				variant="secondary"
				class="px-10"
				disabled={!$canGoBack}
				on:click={() => store.previous()}>Previous</Button
			>
			{#if $currentStep !== 'confirmation-and-payment'}
				<Button class="px-10" disabled={!$canGoNext} on:click={() => store.next()}>Next</Button>
			{/if}
		</div>
	</main>
{/if}
