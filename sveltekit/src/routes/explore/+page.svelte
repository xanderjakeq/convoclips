<script lang="ts">
    import type { Clip as ClipType } from '$lib/types';

    import Clip from '$lib/components/Clip.svelte';

    export let data;
    let clips: ClipType[] = data.clips;
</script>

<svelte:head>
    <title>explore</title>
</svelte:head>

<div class="md:container md:mx-auto flex justify-center min-h-[80vh]">
    <div class="w-full flex flex-col font-mono w-full max-w-3xl break-words">
        <h1 class="my-5 text-2xl font-bold">recent clips</h1>
        {#each clips as clip (clip.id)}
            <Clip {clip} isPreview={true} />
        {/each}
    </div>
</div>
