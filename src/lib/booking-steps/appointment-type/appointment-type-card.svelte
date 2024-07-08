<script lang="ts">
	import { CheckCheck, Clock, DollarSign, BadgeDollarSignIcon } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { AppointmentType } from '$lib/types';
	import { cn } from '$lib/utils';

	export let appointmentType: AppointmentType;
	export let currencySymbol: string = '£';
	$: at = appointmentType;

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<button on:click on:change on:keydown on:keyup on:mouseenter on:mouseleave>
	<Card.Root class={cn('min-w-72 sm:max-w-96  w-full cursor-pointer ', className)}>
		<Card.Header>
			<Card.Title>{at.name}</Card.Title>
			<Card.Description>{at.description}</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="flex items-center bg-muted rounded-md p-4 justify-center gap-2 flex-col">
				<span class="text-4xl font-bold leading-none">{currencySymbol} {at.price} </span>
				<small class="text-sm text-muted-foreground font-normal">per Appointment</small>
			</div>
			<Separator></Separator>
			<p class="text-sm text-muted-foreground">What's included</p>

			<div class="mb-4 grid grid-cols-[25px_1fr] gap-2 items-start pb-4 last:mb-0 last:pb-0">
				<Clock size="16" class="text-muted-foreground" />
				<p class="text-sm leading-none">
					{at.duration} minutes duration.
				</p>

				{#if at.allowDeposit && at.deposit}
					<DollarSign size="16" class="text-muted-foreground" />
					<p class="text-sm leading-none">
						Book a time with a {currencySymbol}{at.deposit} deposit.
					</p>
				{:else}
					<p class="col-span-2">&nbsp;</p>
				{/if}

				{#if at.refundableDeposit}
					<BadgeDollarSignIcon size="16" class="text-muted-foreground" />
					<p class="text-sm leading-none">Refundable appointment.</p>
				{:else}
					<p class="col-span-2">&nbsp;</p>
				{/if}
			</div>
		</Card.Content>
		<!-- <Card.Footer>
		<button
			on:click
			on:change
			on:keydown
			on:keyup
			on:mouseenter
			on:mouseleave
			class="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-gray-900 rounded-full p-px text-xs font-medium leading-6 text-white inline-block w-full"
		>
			<span class="absolute inset-0 overflow-hidden rounded-full">
				<span
					class="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></span>
			</span>
			<div
				class="relative flex justify-center space-x-2 items-center z-10 rounded-full bg-gray-950 py-2.5 px-4 ring-1 ring-white/10 text-base"
			>
				Select
				<CheckCheck class="mx-2 h-4 w-4" />
			</div>
			<span
				class="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"
			></span>
		</button>
	</Card.Footer> -->
	</Card.Root>
</button>
