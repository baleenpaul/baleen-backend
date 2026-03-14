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
- **Live site**: https://baleen-frontend.netlify.app
---
## 🛠 Tech Stack
### Backend (`baleen-backend`)
- **Runtime**: Node.js v22
- **Language**: TypeScript
- **Framework**: Express
- **Deployed**: Render — https://baleen-backend.onrender.com

### Frontend (`baleen-frontend`)
- **Framework**: Next.js 14.2.35 with React 18 and Tailwind CSS
- **Deployed to**: Netlify — https://baleen-frontend.netlify.app
- **Status**: ✅ Live and fully functional

### Platforms Being Integrated
- ✅ Bluesky (`blueskyClient.ts`)
- ✅ Mastodon (`mastodonClient.ts`)
- 🔄 Threads (in progress — OAuth flow being implemented)
- ⬜ Twitter/X (TBD)
---
## 📁 Backend File Structure
```
baleen-backend/
├── src/
│   ├── config.ts               # App configuration
│   ├── server.ts               # Entry point / Express server
│   ├── routes/
│   │   ├── feed.ts             # Feed API routes
│   │   └── auth.ts             # OAuth routes (Threads)
│   ├── services/
│   │   ├── blueskyClient.ts    # Bluesky API integration
│   │   ├── mastodonClient.ts   # Mastodon API integration
│   │   ├── threadsClient.ts    # Threads API integration
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
- [x] Removed credentials from server logs
- [x] Backend deployed to Render
- [x] Bluesky and Mastodon credentials secured in Render env vars
- [x] Frontend code (Next.js + Tailwind) built and pushed to GitHub
- [x] Frontend deployed to Netlify
- [x] TypeScript build errors fixed
- [x] Frontend connected to backend API
- [x] Feed loading live from backend ✅
- [x] Threads OAuth service created (`threadsClient.ts`)
- [x] OAuth routes created (`auth.ts`)
- [x] Meta app configured with redirect URIs
- [x] Environment variables added to Render (THREADS_APP_ID, THREADS_APP_SECRET)
---
## 🔄 In Progress
- 🔄 **Threads OAuth flow** — Auth routes created but `/auth/threads/login` returning 404
  - Created `threadsClient.ts` with OAuth methods
  - Created `auth.ts` with routes: `/threads/login`, `/threads/callback`, `/threads/uninstall`, `/threads/delete`
  - Meta app configured at: https://developers.meta.com/
  - Added `node-fetch` dependency
  - Routes imported and registered in `server.ts`
  - **Current issue**: Route not accessible — debugging route registration
  - Next: Verify route compilation and restart service
---
## 🔄 Next Steps (Priority Order)
1. **Debug Threads OAuth route** — Fix 404 error on `/auth/threads/login`
2. **Complete Threads OAuth flow** — Test full login → token exchange → feed access
3. **Cross-posting feature** — Allow users to post to multiple platforms
4. **UI refinements** — Polish animations and user experience
5. **Twitter/X integration** — Add X/Twitter to platform list
---
## 🔑 Key Decisions & Notes
- Backend on Render, Frontend on Netlify (two separate deploys)
- Frontend API calls point to: `https://baleen-backend.onrender.com`
- `feedNormalizer.ts` creates unified post schema across platforms
- `filterEngine.ts` provides intelligent content filtering (deduplication, muting, highlighting)
- Frontend features: Like/repost tracking, deduplication toggle, filter settings menu
- Beautiful whale-themed splash screen with animated baleen filter visualization
- Threads OAuth setup:
  - App ID: 1581961063067972
  - Redirect URI: https://baleen-backend.onrender.com/auth/threads/callback
  - Scopes: threads_basic_access, threads_content_publish
---
## 🌍 Environment Variables (keys only — never commit values)
```
BLUESKY_IDENTIFIER=
BLUESKY_APP_PASSWORD=
MASTODON_URL=
MASTODON_ACCESS_TOKEN=
THREADS_APP_ID=1581961063067972
THREADS_APP_SECRET=
FRONTEND_URL=https://baleen-frontend.netlify.app
```
---
## 📅 Session Log
| Date | What was done |
|------|--------------|
| Mar 13 2026 | Backend scaffolded, Bluesky & Mastodon integrated, deployed to Render. |
| Mar 14 2026 | Frontend built with Next.js, deployed to Netlify, connected to backend. Feed loading live. Started Threads OAuth integration: created threadsClient.ts, auth.ts routes, configured Meta app, added env vars to Render. Debugging route 404 issue. |
---
## 🐛 Known Issues
- **Threads OAuth route 404**: `/auth/threads/login` returning "Cannot GET /auth/threads/login"
  - Routes are in `auth.ts` and imported in `server.ts`
  - Files compiled to `dist/routes/auth.js`
  - Server is running but route not accessible
  - Likely: Route registration issue or server not reloading with changes

---
*Update this file at the end of every session. Ask Claude: "Update PROJECT_CONTEXT.md to reflect what we did today."*
```

---

Push this update:
```
git add .
```
```
git commit -m "Update PROJECT_CONTEXT.md - Threads OAuth in progress, debugging route issue"
```
```
git push
