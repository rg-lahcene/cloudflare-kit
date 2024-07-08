<script lang="ts">
	import type { User } from '$lib/types';
	import PractitionerCard from './practitioner-card.svelte';
	import { store } from '$lib/store';
	import { fly } from 'svelte/transition';

	//
	export let practitioners: User[] | undefined;
	const { therapist } = store;
</script>

<div in:fly={{ x: 20 }}>
	{#if practitioners && practitioners.length > 0}
		<ul class="flex flex-col gap-2">
			{#each practitioners as user}
				<li>
					<PractitionerCard
						on:click={() => store.selectTherapist(user)}
						practitioner={user}
						class={user.objectId === $therapist?.objectId ? 'bg-muted  ring-1 ring-primary' : ''}
					/>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No practitioner found</p>
	{/if}
</div>

<style>
</style>
