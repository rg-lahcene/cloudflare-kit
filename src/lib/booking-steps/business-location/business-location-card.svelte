<script lang="ts">
	import type { BusinessLocation } from '$lib/types';
	import { cn } from '$lib/utils';
	import { Globe, Phone } from 'lucide-svelte';

	export let businessLocation: BusinessLocation;
	$: bl = businessLocation;

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<button
	on:click
	on:change
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave
	class={cn(
		'border rounded md:px-6 px-3 md:py-4 py-2 grid md:grid-cols-[auto_20rem] grid-cols-1 gap-6  text-left hover:bg-muted transition-all w-full list-card',
		className
	)}
>
	<div class="flex flex-col order-2 md:order-1">
		<h1 class="font-semibold text-xl">{bl.name}</h1>

		{#if bl.address}
			<div class="text-muted-foreground mt-2">
				<p>{bl.address.country}, {bl.address.city}</p>
				<p>{bl.address.postalCode}</p>
				<p>{bl.address.address}</p>
			</div>
		{/if}
	</div>
	<div class="flex gap-3 flex-col justify-between h-full pt-2 order-1 md:order-2">
		<img src={bl.logo} alt={bl.name} class="w-40" />
		<div class="text-muted-foreground text-sm">
			<p class="flex gap-2 items-center"><Phone class="w-4 h-4" /> {bl.phone}</p>
			<p class="flex gap-2 items-center mt-1">
				<Globe class="w-4 h-4" />
				<span> {bl.website}</span>
			</p>
		</div>
	</div>
</button>
