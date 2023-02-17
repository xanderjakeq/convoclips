<script lang="ts">
	import type { Message } from '$lib/types';

    export let showAuthor = true;
    export let message: Omit<Message, "id">;
</script>

{#if showAuthor}
	<h2 class="font-bold">
		{message.author}
	</h2>
{/if}

<p class="whitespace-pre-wrap pl-3">
	{message.content}
</p>
