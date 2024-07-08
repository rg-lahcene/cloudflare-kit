<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Input, baseInputClasses } from '$lib/components/ui/input';
	import { TelInput, normalizedCountries } from 'svelte-tel-input';
	import 'svelte-tel-input/styles/flags.css';
	import type { CountryCode, E164Number, TelInputOptions, Country } from 'svelte-tel-input/types';
	import { schema, type ClientFormSchema } from './schema';
	import { fade, fly } from 'svelte/transition';
	import Checkbox from '$components/ui/checkbox/checkbox.svelte';
	import { store } from '$lib/store';
	import Button from '$components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	import type { ClientDetails } from '$lib/types';
	import Label from '$components/ui/label/label.svelte';
	import { enhance } from '$app/forms';
	import { ZodError } from 'zod';

	// phone number
	let countrySearchTerm = '';
	$: filteredCountries = getFilteredCountries(countrySearchTerm);
	let countryListOpen = false;
	let phoneNumberValue: E164Number | null;
	let selectedCountryCode: CountryCode | null = 'GB';
	let isPhoneNumberValid: boolean;
	let options: TelInputOptions = { format: 'national', invalidateOnCountryChange: true };
	const e164Input_id = 'e164Input';

	onMount(() => {
		phoneNumberValue = data?.phoneNumber?.e164;
		if (!phoneNumberValue) return;
		let el = document.getElementById(e164Input_id) as HTMLInputElement;
		el && (el.value = phoneNumberValue);
	});

	// form reactive validation
	$: {
		const { success, error, data: value } = schema.safeParse(data);
		errors = error instanceof ZodError ? error.flatten().fieldErrors : {};
		// phonenumber has its own validation

		errors.phoneNumber = !isPhoneNumberValid ? ['Please enter a valid phone number'] : '';
		const formValue = value ?? data;
		store.selectClientDetails({
			data: formValue as unknown as ClientDetails,
			isValid: success && isPhoneNumberValid,
			errors
		});
	}
	let { clientForm } = store;
	let { data, errors } = $clientForm;
	let dirtyFields: Record<string, boolean> = {};

	const confirmationItems = [
		{ text: ' I have carefully reviewed my personal and appointment details' }
	];

	// functions
	function addItem(id: string) {
		data.confirmationItems = [...data.confirmationItems, id];
	}

	function removeItem(id: string) {
		data.confirmationItems = data.confirmationItems.filter((i) => i !== id);
	}

	function selectCountry(country: Country) {
		selectedCountryCode = country.iso2;
		countryListOpen = false;
	}

	function getFilteredCountries(term: string) {
		const q = term.toLowerCase();
		if (!q) {
			return normalizedCountries;
		}
		return normalizedCountries.filter((c) => c.label?.toLowerCase()?.includes(q));
	}
	function markAsDirty(field: string) {
		dirtyFields[field] = true;
	}
</script>

<div in:fly={{ x: 20 }}>
	<form method="POST" use:enhance class=" flex flex-col gap-2 max-w-xl">
		<fieldset>
			<Label for="firstName">First Name</Label>
			<Input on:blur={() => markAsDirty('firstName')} id="firstName" bind:value={data.firstName} />
			{#if dirtyFields['firstName'] && errors['firstName']}
				<p in:fly={{ y: -3 }} class="text-red-500 text-sm mt-1">{errors.firstName}</p>
			{/if}
		</fieldset>

		<fieldset>
			<Label for="lastName">Last Name</Label>
			<Input on:blur={() => markAsDirty('lastName')} id="lastName" bind:value={data.lastName} />
			{#if dirtyFields['lastName'] && errors['lastName']}
				<p in:fly={{ y: -3 }} class="text-red-500 text-sm mt-1">{errors.lastName}</p>
			{/if}
		</fieldset>

		<fieldset>
			<Label for="email">Email</Label>
			<Input on:blur={() => markAsDirty('email')} id="email" type="email" bind:value={data.email} />
			{#if dirtyFields['email'] && errors['email']}
				<p in:fly={{ y: -3 }} class="text-red-500 text-sm mt-1">{errors.email}</p>
			{/if}
		</fieldset>
		<!-- phone number -->
		<fieldset>
			<Label>Phone</Label>
			<div class="flex">
				<Button
					variant="outline"
					class="rounded-r-none rounded-l-xl h-14 {isPhoneNumberValid
						? ''
						: 'border-2 border-red-600'}"
					on:click={() => (countryListOpen = true)}
				>
					<span class="flag flag-{selectedCountryCode?.toLowerCase()} flex-shrink-0 mr-3" />
				</Button>
				<Popover.Root bind:open={countryListOpen}>
					<Popover.Trigger />
					<Popover.Content class="w-[380px]  h-96 overflow-scroll text-xs">
						<div class="relative">
							<Input
								class="absolute top-0 left-0 right-0 h-8 rounded-md"
								placeholder="Search a country"
								bind:value={countrySearchTerm}
							/>
							<div class="flex flex-col absolute top-12 left-0 right-0">
								{#each filteredCountries as currentCountry (currentCountry.id)}
									<Button
										type="button"
										variant="outline"
										aria-selected={currentCountry.iso2 === selectedCountryCode}
										class="inline-flex items-center text-sm text-left justify-between border-none rounded-none w-full {currentCountry.iso2 ===
										selectedCountryCode
											? 'bg-muted'
											: ''}"
										on:click={() => selectCountry(currentCountry)}
									>
										<div>
											<span
												class="flag flag-{currentCountry.iso2.toLowerCase()} flex-shrink-0 mr-3"
											/>
											<span class="mr-2 max-w-36 truncate">{currentCountry.name}</span>
										</div>
										<span class="text-gray-500">+{currentCountry.dialCode}</span>
									</Button>
								{/each}
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>
				<!--  -->
				<TelInput
					{options}
					bind:value={phoneNumberValue}
					bind:detailedValue={data.phoneNumber}
					bind:valid={isPhoneNumberValid}
					bind:country={selectedCountryCode}
					on:blur={() => markAsDirty('phoneNumber')}
					id={e164Input_id}
					class="{baseInputClasses} rounded-l-none border-l-0 {isPhoneNumberValid
						? ''
						: 'border-1 border-red-600'}"
				/>
			</div>
			{#if dirtyFields['phoneNumber'] && errors['phoneNumber']}
				<p in:fly={{ y: -3 }} class="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
			{/if}
		</fieldset>

		<!-- confirmation checkboxes -->
		<fieldset class="space-y-0 mt-3">
			<div class="space-y-1">
				{#each confirmationItems as item}
					{@const checked = data.confirmationItems?.includes(item.text)}
					<div class="flex flex-row items-start space-x-3">
						<Checkbox
							{checked}
							onCheckedChange={(v) => {
								markAsDirty('confirmationItems');
								if (v) {
									addItem(item.text);
								} else {
									removeItem(item.text);
								}
							}}
						/>
						<Label class="text-sm font-normal">
							{item.text}
						</Label>
						<input hidden type="checkbox" name="confirmationItems" value={item.text} {checked} />
					</div>
				{/each}
			</div>
			{#if dirtyFields['confirmationItems'] && errors['confirmationItems']}
				<p in:fly={{ y: -3 }} class="text-red-500 text-sm mt-1">{errors.confirmationItems}</p>
			{/if}
		</fieldset>
	</form>
</div>
