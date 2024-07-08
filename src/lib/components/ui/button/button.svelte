<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { type Events, type Props, buttonVariants } from './index.js';
	import { cn } from '$lib/utils.js';
	import { LoaderCircle } from 'lucide-svelte';

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let loading: boolean | undefined;
	export let builders: $$Props['builders'] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	disabled={loading}
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
	{#if loading}
		<LoaderCircle class="ml-2 h-8 w-8 animate-spin"></LoaderCircle>
	{/if}
</ButtonPrimitive.Root>
