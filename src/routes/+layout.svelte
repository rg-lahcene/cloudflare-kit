<script>
	// import { setInitialClassState } from '$lib/components/ui/dark-mode-toggle';
	/* fonts */
	import '@fontsource/poppins';
	import '@fontsource/poppins/400.css';
	import '@fontsource/poppins/500.css';
	import '@fontsource/poppins/600.css';
	import '@fontsource/poppins/700.css';
	import '@fontsource/poppins/800.css';
	import '../app.postcss';
</script>

<svelte:head>
	<!-- This causes the new eslint-plugin-svelte: https://github.com/sveltejs/eslint-plugin-svelte/issues/492 -->
	<!-- {@html `<script nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})();</script>`} -->
</svelte:head>

<main class="relative max-w-7xl mx-auto">
	<slot />
</main>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
	}
</style>
