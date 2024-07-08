<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { store } from '$lib/store';
	import { CheckCircleIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { DarkModeToggle } from '$components/ui/dark-mode-toggle';

	const { appointmentDate, clientForm, appointmentDateAndTime } = store;
	$: email = $clientForm?.data?.email;

	let animate = false;

	onMount(() => {
		animate = true;
	});
</script>

{#key animate}
	<main
		in:fade={{ delay: 700, duration: 300 }}
		class="grid min-h-full h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8 absolute"
	>
		<!-- <DarkModeToggle class="absolute bottom-2 left-2"></DarkModeToggle> -->
		<div class="text-center flex items-center justify-center gap-2 flex-col">
			<span in:fly={{ x: -20, delay: 1000 }}>
				<CheckCircleIcon class="text-emerald-500 sm:w-24 sm:h-24 w-16 h-16" />
			</span>
			<div class=" flex items-center gap-2">
				<h1 class="text-2xl font-bold tracking-tight sm:text-5xl">
					Appointment scheduled
					<span class="underline text-emerald-500">successfully</span>
				</h1>
			</div>
			<p class="mt-6 text-lg leading-7 text-muted-foreground">
				Your appointment has been successfully created. Please check your email ({email}) for
				further instructions.
			</p>
		</div>
	</main>
{/key}
