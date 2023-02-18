<script lang="ts">
	import type { Clip as ClipType, DC_Server } from '$lib/types';

	import Clip from '$lib/components/Clip.svelte';

	export let data: { server: DC_Server; clips: ClipType[] };

	const { server, clips } = data;
</script>

<div class="md:container md:mx-auto flex justify-center min-h-[80vh]">
	<div class="flex flex-col font-mono w-full max-w-3xl break-words">
		<h1 class="my-5 text-2xl font-bold">{server.name}</h1>
		{#if server.website}
			<a href={server.website} class="my-5 text-sm font-italic">{server.website}</a>
		{/if}

		{#each clips as clip (clip.id)}
            <Clip {clip} isPreview={true} showServer={false}/>
		{/each}
	</div>
</div>
