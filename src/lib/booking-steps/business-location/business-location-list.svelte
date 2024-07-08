<script lang="ts">
	import type { BusinessLocation } from '$lib/types';

	import BusinessLocationCard from './business-location-card.svelte';
	import { store } from '$lib/store';
	import { fly } from 'svelte/transition';

	export let businessLocations: BusinessLocation[];
	// const { selectedBusinessLocation } = store;
</script>

<div in:fly={{ x: 10 }}>
	{#if businessLocations.length > 0}
		<div>
			<p class="text-lg mb-6 font-semibold">Please choose a location to begin</p>

			<ul class="flex flex-col gap-2">
				{#each businessLocations as bl (bl.id)}
					<li>
						<!-- <BusinessLocationCard
							on:click={() => store.selectedBusinessLocation.set(bl)}
							businessLocation={bl}
							class={bl.id === $selectedBusinessLocation?.id ? 'bg-muted  ring-1 ring-primary' : ''}
						/> -->
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p>No business locations found</p>
	{/if}
</div>

<style>
</style>
