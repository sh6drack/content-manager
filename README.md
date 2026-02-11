# Content Manager

Personal social media command center. Schedule, publish, and track posts across X, Instagram, LinkedIn, TikTok, YouTube, and Threads — all from one dark-themed dashboard.

Built to replace Buffer ($120/yr) with something better.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: Auth.js v5 (Google sign-in, JWT sessions)
- **Media**: Vercel Blob
- **Hosting**: Vercel (with Cron Jobs)
- **Styling**: Tailwind CSS v4

## Features

- Calendar-based post scheduling with platform-colored pills
- Compose modal with split-panel platform previews and character counters
- OAuth connections for all 6 platforms with encrypted token storage (AES-256-GCM)
- Automatic token refresh before API calls
- "Post Now" or schedule for later — cron publishes every minute
- Media library with drag-and-drop upload (Vercel Blob)
- Analytics dashboard with per-platform breakdown
- Retry logic (3 attempts with exponential backoff)

## File Structure

```
content-manager/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Auth-gated route group
│   │   │   ├── layout.tsx        # 3-column: NavRail + Sidebar + main
│   │   │   ├── page.tsx          # Calendar view (home)
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   ├── media/            # Media library grid
│   │   │   └── settings/         # Platform connections
│   │   ├── api/
│   │   │   ├── analytics/        # Aggregated metrics
│   │   │   ├── auth/[...nextauth]/ # Auth.js route
│   │   │   ├── cron/
│   │   │   │   ├── publish/      # Every-minute scheduled publisher
│   │   │   │   └── analytics/    # 6-hourly metrics fetch
│   │   │   ├── media/            # Upload + delete
│   │   │   ├── platforms/        # OAuth connect/callback/disconnect
│   │   │   └── posts/            # CRUD + publish
│   │   ├── login/                # Sign-in page
│   │   ├── globals.css           # Design tokens + Tailwind v4 theme
│   │   └── layout.tsx            # Root layout (Sora font, Providers)
│   ├── auth/                     # Auth.js v5 config
│   ├── components/               # UI components
│   ├── db/
│   │   ├── schema.ts             # 9 tables, 3 enums
│   │   └── index.ts              # Neon + Drizzle client
│   ├── hooks/                    # SWR hooks for posts
│   ├── lib/
│   │   ├── constants.ts          # Platform types, colors, char limits
│   │   ├── crypto.ts             # AES-256-GCM encrypt/decrypt
│   │   ├── oauth-configs.ts      # OAuth URLs + scopes for all 6 platforms
│   │   └── validations.ts        # Zod schemas
│   ├── middleware.ts             # JWT auth guard
│   └── services/
│       ├── posts.ts              # Posts CRUD service
│       ├── publisher.ts          # Multi-platform publish orchestrator
│       ├── media.ts              # Vercel Blob upload/delete
│       ├── analytics.ts          # Metrics aggregation + fetch
│       ├── token-refresh.ts      # Auto-refresh expired OAuth tokens
│       └── platforms/            # Platform adapters
│           ├── types.ts          # PlatformAdapter interface
│           ├── index.ts          # Adapter registry
│           ├── x.ts              # X/Twitter v2 API
│           ├── instagram.ts      # Meta Graph API (container → publish)
│           ├── linkedin.ts       # LinkedIn Posts API
│           ├── tiktok.ts         # TikTok Content Posting API
│           ├── youtube.ts        # YouTube Data API v3
│           └── threads.ts        # Threads API
├── drizzle.config.ts
├── vercel.json                   # Cron schedules
└── .env.example                  # All required env vars
```

## SSD Backup Structure

The project maintains a local backup on an external SSD (`/Volumes/360 4TB/content-manager/`) as the source of truth alongside the GitHub repo.

**What gets synced to SSD:**
- All source code, config, and assets
- `.env.example` (template only — no secrets)

**What does NOT get synced:**
- `node_modules/` (reinstall with `npm install`)
- `.next/` (rebuild with `npm run build`)
- `.env.local` (contains secrets — recreate from `.env.example`)

**Sync commands:**

```bash
# Push local → SSD
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.env.local' \
  ~/projects/content-manager/ "/Volumes/360 4TB/content-manager/"

# Pull SSD → local (if restoring)
rsync -a --exclude='node_modules' --exclude='.next' \
  "/Volumes/360 4TB/content-manager/" ~/projects/content-manager/

# After pulling from SSD, reinstall deps and recreate env:
cd ~/projects/content-manager
npm install
cp .env.example .env.local  # then fill in your secrets
```

**Recovery from scratch:**
```bash
# Option A: From GitHub
git clone https://github.com/sh6drack/content-manager.git
cd content-manager && npm install
cp .env.example .env.local  # fill in secrets

# Option B: From SSD
cp -r "/Volumes/360 4TB/content-manager" ~/projects/content-manager
cd ~/projects/content-manager && npm install
cp .env.example .env.local  # fill in secrets
```

## Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/sh6drack/content-manager.git
   cd content-manager && npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all values — at minimum you need `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `ENCRYPTION_KEY`.

3. **Push database schema:**
   ```bash
   npx drizzle-kit push
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

5. **Connect platforms:** Sign in → Settings → click Connect on each platform.

## Environment Variables

| Variable | Purpose | How to get it |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | [neon.tech](https://neon.tech) |
| `AUTH_SECRET` | Auth.js session signing | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID/SECRET` | Google sign-in | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `ENCRYPTION_KEY` | AES-256 token encryption | `openssl rand -hex 32` |
| `X_CLIENT_ID/SECRET` | X/Twitter API | [developer.x.com](https://developer.x.com) |
| `META_APP_ID/SECRET` | Instagram + Threads | [developers.facebook.com](https://developers.facebook.com) |
| `LINKEDIN_CLIENT_ID/SECRET` | LinkedIn API | [linkedin.com/developers](https://www.linkedin.com/developers) |
| `TIKTOK_CLIENT_KEY/SECRET` | TikTok API | [developers.tiktok.com](https://developers.tiktok.com) |
| `GOOGLE_CLIENT_ID/SECRET` | YouTube API | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob media storage | Vercel dashboard → Storage |
| `CRON_SECRET` | Cron endpoint auth | `openssl rand -hex 16` |
