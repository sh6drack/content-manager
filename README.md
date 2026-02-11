# Content Manager

Personal social media command center. Schedule, publish, and track posts across X, Instagram, LinkedIn, TikTok, YouTube, and Threads from one dashboard.

Built to replace Buffer ($120/yr) with something you actually own.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: Auth.js v5 (Google sign-in)
- **Media**: Hybrid local SSD + Vercel Blob (see below)
- **Hosting**: Vercel (with Cron Jobs)
- **Styling**: Tailwind CSS v4

## What It Does

- **Calendar view** — see all your scheduled and published posts at a glance, color-coded by platform
- **Compose modal** — write once, preview per-platform with live character counters, attach media
- **6 platforms** — X, Instagram, LinkedIn, TikTok, YouTube, Threads — connect via OAuth in Settings
- **Schedule or post now** — cron job checks every minute for due posts and publishes them
- **Retry on failure** — failed posts retry up to 3 times before marking as permanently failed
- **Media library** — upload images/videos, reuse across posts
- **Analytics** — per-platform metrics pulled every 6 hours, aggregated in a dashboard
- **Encrypted tokens** — platform OAuth tokens stored with AES-256-GCM, auto-refreshed before expiry

## How Media Works (Hybrid SSD + Cloud)

Content Manager uses a **hybrid approach** to media storage so you're not paying cloud storage fees for your entire library:

```
┌─────────────────────┐     upload to compose     ┌──────────────────────┐
│   YOUR LOCAL SSD    │ ──────────────────────────>│   VERCEL BLOB        │
│   (source of truth) │                            │   (cloud staging)    │
│                     │     Media lives here       │                      │
│   All your images,  │     permanently. Full      │   Only holds files   │
│   videos, exports.  │     resolution. No         │   attached to posts. │
│   Organized however │     monthly fees.          │   Used for publishing│
│   you want.         │                            │   to platforms.      │
└─────────────────────┘                            └──────────────────────┘
```

**The idea:** Your SSD is the permanent home for all media. When you attach a file to a post, it gets uploaded to Vercel Blob (cloud) so the server can access it for publishing. Your SSD stays the source of truth — if cloud storage gets wiped, you re-upload from your drive.

**Why not just use cloud storage for everything?**
- Cloud storage costs scale with file count. An SSD is a one-time purchase.
- You keep full ownership of your media offline.
- Publishing only needs temporary cloud access to the file.

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/sh6drack/content-manager.git
cd content-manager
npm install
```

### 2. Set up your database

Create a free Postgres database at [neon.tech](https://neon.tech), copy the connection string.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values. At minimum you need:

| Variable | What it is | How to generate |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | Copy from Neon dashboard |
| `AUTH_SECRET` | Signs auth sessions | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Same as above |
| `ENCRYPTION_KEY` | Encrypts platform tokens | `openssl rand -hex 32` |

The rest are per-platform API keys — you can add them as you connect each platform:

| Variable | Platform | Developer portal |
|---|---|---|
| `X_CLIENT_ID/SECRET` | X / Twitter | [developer.x.com](https://developer.x.com) |
| `META_APP_ID/SECRET` | Instagram + Threads | [developers.facebook.com](https://developers.facebook.com) |
| `LINKEDIN_CLIENT_ID/SECRET` | LinkedIn | [linkedin.com/developers](https://www.linkedin.com/developers) |
| `TIKTOK_CLIENT_KEY/SECRET` | TikTok | [developers.tiktok.com](https://developers.tiktok.com) |
| `GOOGLE_CLIENT_ID/SECRET` | YouTube | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `BLOB_READ_WRITE_TOKEN` | Media uploads | Vercel dashboard → Storage |
| `CRON_SECRET` | Secures cron endpoints | `openssl rand -hex 16` |

### 4. Push database schema

```bash
npx drizzle-kit push
```

### 5. Run it

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000), sign in with Google, head to Settings to connect your platforms.

## SSD Setup (Optional but Recommended)

If you want to use the hybrid media approach with a local drive:

### Initial setup

Pick any external SSD or dedicated folder on your machine. Sync the project to it:

```bash
# Replace /path/to/your/ssd with your actual mount point
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.env.local' \
  ./content-manager/ /path/to/your/ssd/content-manager/
```

### Keeping it in sync

After making changes, push to both GitHub and your SSD:

```bash
# Push to GitHub
git add -A && git commit -m "your message" && git push

# Sync to SSD
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.env.local' \
  ./content-manager/ /path/to/your/ssd/content-manager/
```

### Restoring from SSD

If you lose your local copy or move to a new machine:

```bash
cp -r /path/to/your/ssd/content-manager ~/projects/content-manager
cd ~/projects/content-manager
npm install
cp .env.example .env.local  # fill in your secrets
npx drizzle-kit push         # only if DB is fresh
```

### What goes where

| Location | Contains | Secrets? |
|---|---|---|
| **GitHub** | All source code, configs, `.env.example` | No |
| **SSD** | Same as GitHub + any local media exports | No |
| **`.env.local`** | API keys, DB connection, encryption key | Yes — never committed or synced |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Auth-gated pages
│   │   ├── page.tsx           # Calendar (home)
│   │   ├── analytics/         # Metrics dashboard
│   │   ├── media/             # Media library
│   │   └── settings/          # Platform connections
│   ├── api/
│   │   ├── posts/             # CRUD + publish
│   │   ├── platforms/         # OAuth connect/callback/disconnect
│   │   ├── media/             # Upload + delete
│   │   ├── analytics/         # Aggregated metrics
│   │   └── cron/              # Scheduled publishing + analytics fetch
│   └── login/
├── services/
│   ├── posts.ts               # Post CRUD logic
│   ├── publisher.ts           # Multi-platform publish orchestrator
│   ├── media.ts               # Vercel Blob upload/delete
│   ├── analytics.ts           # Metrics aggregation
│   ├── token-refresh.ts       # Auto-refresh expired OAuth tokens
│   └── platforms/
│       ├── x.ts               # X/Twitter v2 API
│       ├── instagram.ts       # Meta Graph API
│       ├── linkedin.ts        # LinkedIn Posts API
│       ├── tiktok.ts          # TikTok Content Posting API
│       ├── youtube.ts         # YouTube Data API v3
│       └── threads.ts         # Threads API
├── db/schema.ts               # 9 tables, 3 enums (Drizzle)
├── lib/
│   ├── crypto.ts              # AES-256-GCM encrypt/decrypt
│   └── oauth-configs.ts       # OAuth URLs + scopes per platform
└── middleware.ts               # JWT auth guard
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env vars from `.env.local` to your Vercel project settings. The `vercel.json` configures two cron jobs automatically:

- **Publish cron** — runs every minute, picks up scheduled posts
- **Analytics cron** — runs every 6 hours, fetches metrics from platform APIs

## Notes

- **TikTok** requires an approved developer app (review takes 2-4 weeks). You can connect the other 5 platforms immediately.
- **Instagram** only works with Business or Creator accounts linked to a Facebook Page.
- **YouTube** uses user OAuth (not service accounts) — each user authorizes their own channel.
- Media uploads hit a 50MB limit per file. For larger videos, consider uploading directly to the platform.
