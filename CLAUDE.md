# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 frontend (App Router) for a Multi-Site Management (MSM) POC. Renders content from Sanity with two-level inheritance — master posts are shared across sites, and each site can override individual fields. Connects to Sanity project `n3sgk7y6` / dataset `production`.

## Commands

```bash
npm run dev          # Start at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## Tech Stack

- Next.js 16 with App Router
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `next-sanity` for Sanity client and PortableText rendering
- `@sanity/image-url` for image URL generation

## Sanity Client

Defined in `src/sanity/client.ts`. Uses `useCdn: false` for fresh data. All page fetches use `{ next: { revalidate: 5 } }` for 5-second ISR.

## Routes

- `/` — Lists all sites and master posts
- `/[siteId]` — Lists site-specific posts for a given site
- `/[siteId]/[slug]` — Single site post with full content

## GROQ Inheritance Pattern

The frontend resolves inheritance at query time using GROQ `select()`. No application-level inheritance logic needed:

```groq
"effectiveTitle": select(
  inheritanceEnabled == false => title,
  "title" in overriddenFields => title,
  masterPost->title
)
```

This pattern is repeated for each inheritable field (title, slug, publishedAt, image, body). The priority:
1. If `inheritanceEnabled` is `false` → use local value (full override mode)
2. If field is in `overriddenFields` → use local value (per-field override)
3. Otherwise → dereference from `masterPost`

## Content Model (from Sanity)

- **`post`** — Master content (title, slug, publishedAt, image, body)
- **`site`** — Tenant config with `siteId` used in route matching
- **`sitePost`** — Links a post to a site. Has `inheritanceEnabled` (boolean) and `overriddenFields` (string array) controlling which fields are local vs inherited.
