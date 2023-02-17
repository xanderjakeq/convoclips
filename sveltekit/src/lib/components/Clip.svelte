<script lang="ts">
	import type { Clip } from '$lib/types';

	import Message from './Message.svelte';

	export let clip: Clip;
	export let isPreview = false;
	export let showServer = true;

	const previewLimit = 3;

	const messages: Clip['messages'] = isPreview
		? clip.messages.slice(0, previewLimit)
		: clip.messages;
</script>

<a
	href="/clip/{clip.id}"
	class="my-5 p-2 border-solid border-2 border-oxfordBlue
    hover:border-viridian hover:cursor-pointer w-full"
>
	{#if showServer}
		<a href="/server/{clip.dc_serverId}" class="hover:text-viridian">server</a>
	{/if}
	{#each messages as message, i}
		<Message showAuthor={i === 0 || message.author != clip.messages[i].author} {message} />
	{/each}
	{#if clip.messages.length > previewLimit + 1 && isPreview}
		<span class="block mt-3">more...</span>
	{/if}
</a>
