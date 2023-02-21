<script lang="ts">
    import { PUBLIC_BOT_INVITE_URL } from '$env/static/public';
</script>

<svelte:head>
    <title>convoclips</title>
</svelte:head>

<div
    class="md:container md:mx-auto flex items-center justify-center font-mono
    h-screen"
>
    <div class="flex">
        <div class="px-5 flex flex-col items-center justify-between">
            <h1 class="m-0 p-0 text-sm">share your community's wisdom to the world.</h1>

            <a
                href={PUBLIC_BOT_INVITE_URL}
                id="invite"
                class="bg-oxfordBlue hover:bg-viridian hover:text-oxfordBlue
                hover:rounded-2xl
        text-viridian text-5xl p-8 font-bold tracking-widest w-32 font-serif
                self-start">invite convo</a
            >
        </div>
        <ul class="flex flex-col mt-1 mb-0 tracking-[.2em]">
            <li class="ml-2 mb-2 text-oxfordBlue hover:text-viridian hover:underline">
                <a href="/explore">explore</a>
            </li>
            <li class="ml-2 my-2 text-oxfordBlue hover:text-viridian hover:underline">
                <a href="/about">about</a>
            </li>
            <li class="ml-2 mt-2 text-oxfordBlue hover:text-viridian hover:underline">
                <a href="https://github.com/xanderjakeq/convoclips">github</a>
            </li>
        </ul>
    </div>
</div>

<style lang="postcss">
    #invite {
        transition: border-radius 0.1s ease-out;
    }
    li {
        writing-mode: vertical-rl;
        text-orientation: upright;
    }
</style>
