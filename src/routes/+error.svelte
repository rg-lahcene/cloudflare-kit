<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';

	$: message = $page.error?.message ?? 'Something went wrong';
	console.log($page);
</script>

<main class="grid h-screen w-full place-items-center items-center px-6 py-24 sm:py-32 lg:px-8">
	<div class="text-center">
		<p class="font-semibold text-magnum-500">{$page.status}</p>
		<h1 class="mt-4 text-4xl font-bold tracking-tight">{message}</h1>
		<div class="mt-10 flex items-center justify-center gap-x-6">
			<Button href="https://rehabguru.com" class="mt-4">Go to RehabGuru</Button>
		</div>
	</div>
</main>
