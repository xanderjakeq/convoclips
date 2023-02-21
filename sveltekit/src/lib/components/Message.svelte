<script lang="ts">
    import type { Message } from '$lib/types';

    import { m } from '$lib/marked';

    export let showAuthor = true;
    export let message: Omit<Message, 'id'>;
</script>

{#if showAuthor}
    <h2 class="font-bold">
        {message.author}
    </h2>
{/if}

<p class="whitespace-pre-wrap pl-3">
    {#await m(message.content)}
        <div />
    {:then htmlContent}
        {@html htmlContent}
    {:catch error}
        <span> {error.message}</span>
    {/await}
</p>
