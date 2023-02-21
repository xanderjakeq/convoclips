# convoclips
make discord conversations web searchable

## why

there are a lot of valuable conversations happening within discord communities.
but they can never be found using search engines.

after adding the bot to a discord server, convoclips allow community mods to
"/clip" conversations and have it be available for search engines to index.

live [notes](https://catkin-stage-002.notion.site/convoclips-3c6ef58bd51b4d269e53074a66357119).

## development

### stack
- bot
    - [discord.js](https://discord.js.org/#/)
- webapp/[api](./sveltekit/src/routes/api/)
    - [sveltekit](https://kit.svelte.dev/)
    - [planetscale](https://planetscale.com/)
    - [tailwind](https://tailwindcss.com/)

### getting started

```
git clone https://github.com/xanderjakeq/convoclips.git
# install sveltekit dependencies
cd sveltekit && pnpm i

# install bot dependencies
cd bot && pnpm i
```

add a `.env` file in the `sveltekit` dir
```
PUBLIC_BOT_INVITE_URL="https://discord.com/oauth2/authorize?client_id=<CLIENT_ID>&permissions=<PERMISSIONS>&scope=bot"
DATABASE_URL="THE_URL"
```

and in the `bot` dir
```
TOKEN=THE_TOKEN #from https://discord/developers
CLIENT_ID=THE_ID #from https://discord/developers
GUILD_ID=THE_G_ID #your dev discord server ID from discord client
```

### building

sveltekit
```
# start the dev server (needs to be running for the bot to call the api)
pnpm dev
```

bot
```
# deploy commands to development discord server
pnpm commands:staging

# deploy commands to production bot
pnpm commands:prod

# run the bot
pnpm dev
```
