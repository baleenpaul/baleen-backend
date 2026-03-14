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
- 🔄 Threads (in progress — needs live server for Meta OAuth)
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
- [x] Removed credentials from server logs
- [x] Backend deployed to Render
- [x] Bluesky and Mastodon credentials secured in Render env vars
- [x] Frontend code (Next.js + Tailwind) built and pushed to GitHub
- [x] Frontend deployed to Netlify
- [x] TypeScript build errors fixed
- [x] Frontend connected to backend API (https://baleen-backend.onrender.com)
- [x] Feed loading live from backend ✅
---
## 🔄 Next Steps (Priority Order)
1. **Threads integration** — Complete Meta OAuth flow
2. **Cross-posting feature** — Allow users to post to multiple platforms
3. **UI refinements** — Polish animations and user experience
4. **Twitter/X integration** — Add X/Twitter to platform list
5. **Custom domain** — Deploy to custom domain (optional)
---
## 🔑 Key Decisions & Notes
- Backend on Render, Frontend on Netlify (two separate deploys)
- Frontend API calls point to: `https://baleen-backend.onrender.com`
- `feedNormalizer.ts` creates unified post schema across platforms
- `filterEngine.ts` provides intelligent content filtering (deduplication, muting, highlighting)
- Frontend features: Like/repost tracking, deduplication toggle, filter settings menu
- Beautiful whale-themed splash screen with animated baleen filter visualization
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
| Mar 13 2026 | Backend scaffolded, Bluesky & Mastodon integrated, deployed to Render. |
| Mar 14 2026 | Frontend built with Next.js. Deployed to Netlify. Fixed build config and TypeScript errors. Connected frontend to backend API. Feed now loading live at https://baleen-frontend.netlify.app ✅ |
---
*Update this file at the end of every session. Ask Claude: "Update PROJECT_CONTEXT.md to reflect what we did today."*
```

---

Push this update:
```
git add .
```
```
git commit -m "Update PROJECT_CONTEXT.md - frontend and backend fully connected and live"
```
```
git push
