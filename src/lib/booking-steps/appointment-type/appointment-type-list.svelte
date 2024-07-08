<script lang="ts">
	import type { AppointmentType } from '$lib/types';
	import AppointmentTypeCard from './appointment-type-card.svelte';
	import { store } from '$lib/store';
	import { fly } from 'svelte/transition';

	export let appointemntTypes: AppointmentType[] | undefined;
	const { appointmentType, currencySymbol } = store;
</script>

<div in:fly={{ x: 20 }}>
	{#if appointemntTypes && appointemntTypes.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
			{#each appointemntTypes as at}
				<AppointmentTypeCard
					on:click={() => store.selectAppointmentType(at)}
					appointmentType={at}
					{currencySymbol}
					class={at.objectId === $appointmentType?.objectId ? 'bg-muted  ring-1 ring-primary' : ''}
				/>
			{/each}
		</div>
	{:else}
		<p>No appointement types found</p>
	{/if}
</div>
