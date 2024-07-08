<script lang="ts">
	import * as Avatar from '$components/ui/avatar';
	import type { User } from '$lib/types';
	import { cn } from '$lib/utils';
	import { getExternalImageUrl } from '$lib/utils/external-image.utils';

	export let practitioner: User;

	let className: string | undefined | null = undefined;
	export { className as class };

	$: avatarUrl = getExternalImageUrl(practitioner?.avatar ?? '');
	$: initials = `${practitioner.firstName?.[0]}${practitioner.lastName?.[0]}`.toUpperCase();
	$: fullName = [practitioner.firstName, practitioner.lastName].filter(Boolean).join(' ');
</script>

<button
	on:click
	on:change
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave
	class={cn(
		'border rounded-xl  p-6 md:p-8  grid md:grid-cols-[auto_1fr] grid-cols-1 gap-6  text-left hover:bg-muted transition-all w-full list-card',
		className
	)}
>
	<Avatar.Root class="w-20 h-20">
		<Avatar.Image src={avatarUrl} alt={fullName} />
		<Avatar.Fallback>{initials}</Avatar.Fallback>
	</Avatar.Root>

	<div>
		<h1 class="font-semibold text-xl">{fullName}</h1>
		<p class="text-muted-foreground mt-2">
			{practitioner.biography}
		</p>
	</div>
</button>
