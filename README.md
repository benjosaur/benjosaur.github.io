# benjosaur.github.io

Personal blog. Astro + MDX, deployed to GitHub Pages.

## Develop

```bash
bun install
bun run dev          # http://localhost:4321
```

Polls require the Worker URL:

```bash
PUBLIC_POLL_API=https://benjosaur-polls.<account>.workers.dev bun run dev
```

## Write a post

Add a Markdown/MDX file under `src/content/posts/`:

```mdx
---
title: My post
date: 2026-05-22
description: One line that shows up on the home list and in metadata.
---
import Poll from '../../components/Poll.tsx';

Body text here.

<Poll id="my-post-question" question="Was this useful?" />
```

Set `draft: true` in frontmatter to hide a post.

## Build

```bash
bun run build        # outputs to dist/
bun run preview
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

Set the repo-level Actions variable `PUBLIC_POLL_API` to the Worker URL so the deployed site can load and record poll votes.

The polls backend lives in [`worker/`](./worker) and is deployed separately via `wrangler`.
