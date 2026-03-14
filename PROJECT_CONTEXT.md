# Baleen — Project Context & Progress Log
> **Purpose of this file**: Paste this at the start of any new Claude conversation to quickly restore context and continue development without losing progress.
>
> **IMPORTANT: When updating this file, always provide the FULL file content (not snippets), and always specify which file to change.**

---
## 🐋 Project Overview
**Baleen** is a unified, beautifully-designed social media aggregator and cross-poster with intelligent filtering.
- **Goal**: One interface to read, filter, and post across multiple social platforms
- **Name inspiration**: Baleen whales filter-feed — the app filters your social feeds
- **Backend repo**: https://github.com/baleenpaul/baleen-backend
- **Frontend repo**: https://github.com/baleenpaul/baleen-frontend
- **Policy repo**: https://github.com/baleenpaul/baleen-policy
---
## 🛠 Tech Stack
### Backend (`baleen-backend`)
- **Runtime**: Node.js v22
- **Language**: TypeScript
- **Framework**: Express (confirm)
- **Deployed**: Render — https://baleen-backend.onrender.com
### Frontend (`baleen-frontend`)
- **Framework**: Next.js 14.2.35 with React 18 and Tailwind CSS
- **Deployed to**: Netlify — https://baleen-frontend.netlify.app
- **Status**: Deployed but needs debugging (404 error on site load — likely build output issue)
### Platforms Being Integrated
- ✅ Bluesky (`blueskyClient.ts`)
- ✅ Mastodon (`mastodonClient.ts`)
- 🔄 Threads (in progress — needs live server for Meta OAuth, now available via Render)
- ⬜ Twitter/X (TBD)
---
## 📁 Backend File Structure
```
baleen-backend/
├── src/
│   ├── config.ts               # App configuration
│   ├── server.ts               # Entry point / Express server
│   ├── routes/
│   │   └── feed.ts             # Feed API routes
│   ├── services/
│   │   ├── blueskyClient.ts    # Bluesky API integration
│   │   ├── mastodonClient.ts   # Mastodon API integration
│   │   ├── feedNormalizer.ts   # Normalizes posts across platforms
│   │   └── filterEngine.ts    # Intelligent filtering logic
│   └── utils/
│       └── types.ts            # Shared TypeScript types
├── PROJECT_CONTEXT.md
├── .env                        # API keys (not committed)
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```
---
## ✅ Completed
- [x] Backend project scaffolded with TypeScript
- [x] Bluesky client service built
- [x] Mastodon client service built
- [x] Feed normalizer — unified post format across platforms
- [x] Filter engine — intelligent filtering logic
- [x] Feed route (`/feed`)
- [x] Backend pushed to GitHub (`main` branch)
- [x] PROJECT_CONTEXT.md added to repo
- [x] Removed credentials from server logs (console.log deleted from server.ts)
- [x] Backend deployed to Render — https://baleen-backend.onrender.com
- [x] Bluesky and Mastodon credentials rotated and secured in Render env vars
- [x] Frontend deployment switched from Vercel to Netlify
- [x] Frontend code (Next.js + Tailwind) pushed to GitHub
- [x] netlify.toml created with build configuration
- [x] next.config.mjs updated for static export
- [x] Frontend deployed to Netlify
---
## 🔄 Next Steps (Priority Order)
1. **Fix frontend 404 error** — Debug Netlify build output (likely `.next` folder issue)
2. **Threads integration** — Meta requires live HTTPS server for OAuth ✅ now satisfied by Render URL
3. **Connect frontend to backend API** — Frontend needs to call https://baleen-backend.onrender.com/feed
4. **Cross-posting feature**
5. **Full UI/Frontend build**
---
## 🔑 Key Decisions & Notes
- Backend on Render, Frontend on Netlify (two separate deploys) — Netlify chosen over Vercel
- Frontend is Next.js with Tailwind CSS for styling
- `feedNormalizer.ts` creates a unified post schema regardless of platform
- `filterEngine.ts` is the "baleen" core — intelligent content filtering
- Threads API needs a live HTTPS callback URL — now satisfied by Render deploy
- Mastodon app registered at mastodon.social with read/write/follow scopes, website set to Render URL
- netlify.toml configured to build Next.js and export static files
---
## 🌍 Environment Variables (keys only — never commit values)
```
BLUESKY_IDENTIFIER=
BLUESKY_APP_PASSWORD=
MASTODON_URL=
MASTODON_ACCESS_TOKEN=
THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_ACCESS_TOKEN=
```
---
## 📅 Session Log
| Date | What was done |
|------|--------------|
| Mar 13 2026 | Backend pushed to GitHub. PROJECT_CONTEXT.md created. Deployed backend to Render. Removed credential logging. Rotated Bluesky + Mastodon secrets. |
| Mar 14 2026 | Switched frontend deployment from Vercel to Netlify. Updated PROJECT_CONTEXT.md with deployment change. Pushed frontend code to GitHub. Created netlify.toml and updated next.config.mjs for Next.js static export. Frontend now deployed to Netlify (debugging 404 error). |
---
*Update this file at the end of every session. Ask Claude: "Update PROJECT_CONTEXT.md to reflect what we did today."*