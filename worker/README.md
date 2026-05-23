# Polls Worker

Tiny Cloudflare Worker that backs the `<Poll>` component on the blog.

## Endpoints

- `GET /poll/:id` → `{ yes: number, no: number }`
- `POST /poll/:id` body `{ "vote": "yes" | "no" }` → updated counts

`:id` is `[a-z0-9-]{1,64}`. CORS is locked to the blog origins.

## First-time setup

```bash
cd worker
bun install
bunx wrangler kv namespace create POLLS
# paste the returned id into wrangler.toml
bunx wrangler deploy
```

After deploy, copy the Worker URL (e.g. `https://benjosaur-polls.<account>.workers.dev`) and set it as `PUBLIC_POLL_API` in the blog repo (locally in `.env`, and as a GitHub Actions secret/var for production builds).

## Local dev

```bash
bunx wrangler dev
```

Then in the blog: `PUBLIC_POLL_API=http://localhost:8787 bun run dev`.
