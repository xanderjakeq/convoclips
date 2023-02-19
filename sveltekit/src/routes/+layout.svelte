<script lang="ts">
	import '../app.css';
	import logo from '$lib/images/logo.png';
	import { page } from '$app/stores';

	$: route = $page.url.pathname;
	$: renderNav = !(route === '/' || route === '/about');
</script>

<svelte:head>
	<meta name="description" content="share your community's wisdom to the world." />
	<meta property="og:title" content="convoclips" />
	<meta property="og:description" content="share your community's wisdom to the world." />
	<meta property="og:type" content="website" />
    <meta property="og:image" content={`${logo}`} />
	<meta property="og:url" content="https://www.convoclips.com/" />
</svelte:head>

{#if renderNav}
	<nav
		class="md:mx-auto w-full max-w-3xl flex items-start justify-start py-2
    sticky top-0 bg-offWhite border-b-2 border-oxfordBlue"
	>
		<a href="/explore">
			<img alt="logo" src={logo} class="my-3 w-[5rem]" />
		</a>
	</nav>
{/if}

<slot />

{#if $page.route.id != '/'}
	<ul class="my-10 flex justify-center font-mono">
		<li class="mx-5 text-oxfordBlue hover:text-viridian hover:underline">
			<a href="/explore">explore</a>
		</li>
		<li class="mx-5 text-oxfordBlue hover:text-viridian hover:underline">
			<a href="/about">about</a>
		</li>
		<li class="mx-5 text-oxfordBlue hover:text-viridian hover:underline">
			<a href="https://github.com/xanderjakeq/convoclips">github</a>
		</li>
	</ul>
{/if}

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.offWhite);
	}
</style>
