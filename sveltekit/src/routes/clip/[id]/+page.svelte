<script lang="ts">
	import type { Clip as ClipType } from '$lib/types';

	import Clip from '$lib/components/Clip.svelte';
	export let data;
	export let clip: ClipType = data;
</script>

<svelte:head>
    <title>clip {clip.name}</title>
</svelte:head>

<div class="md:container md:mx-auto flex items-center justify-center">
	<div class="w-full flex flex-col font-mono max-w-3xl break-words">
		<Clip {clip} />
	</div>
</div>
