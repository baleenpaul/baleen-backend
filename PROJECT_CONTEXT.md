# Baleen — Project Context & Progress Log

> **Purpose of this file**: Paste this at the start of any new Claude conversation to quickly restore context and continue development without losing progress.

---

## 🐋 Project Overview

**Baleen** is a unified, beautifully-designed social media aggregator and cross-poster with intelligent filtering.

- **Goal**: One interface to read, filter, and post across multiple social platforms
- **Name inspiration**: Baleen whales filter-feed — the app filters your social feeds
- **Repo**: https://github.com/baleenpaul/baleen-backend

---

## 🛠 Tech Stack

### Backend (`baleen-backend`)
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: (likely Express — confirm)
- **Package manager**: npm
- **Key files**: `tsconfig.json`, `package.json`

### Frontend (`baleen-frontend` — separate repo or TBD)
- TBD — not yet built or in early stages

### Platforms Being Integrated
- ✅ Bluesky (`blueskyClient.ts`)
- ✅ Mastodon (`mastodonClient.ts`)
- 🔄 Threads (in progress — required GitHub deployment first)
- ⬜ Twitter/X (TBD)
- ⬜ Others (TBD)

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
│   │   ├── feedNormalizer.ts   # Normalizes posts across platforms into unified format
│   │   └── filterEngine.ts     # Intelligent filtering logic
│   └── utils/
│       └── types.ts            # Shared TypeScript types/interfaces
├── .env                        # API keys and secrets (not committed)
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
- [x] Backend pushed to GitHub (`main` branch, latest: `4c2119b`)
- [x] node_modules excluded / cleaned up in git history

---

## 🔄 In Progress

- [ ] **Threads integration** — was the reason for getting backend onto GitHub (Meta requires a publicly accessible server for Threads API webhooks/auth)
- [ ] **Deploy backend to Render**
- [ ] **Deploy frontend to Vercel** (frontend may not be started yet)

---

## 📋 Next Steps (Priority Order)

1. **Deploy backend to Render**
   - Connect GitHub repo to Render
   - Set environment variables (`.env` values)
   - Confirm build/start commands (`tsc && node dist/server.js` or similar)
2. **Deploy frontend to Vercel** (once frontend exists)
3. **Continue Threads integration**
   - Meta requires app review + live server for Threads API
   - Need callback/webhook URL from Render deployment
4. **Cross-posting feature**
5. **UI/Frontend build** (if not started)

---

## 🔑 Key Decisions & Notes

- Backend separated from frontend (two repos or monorepo — confirm)
- `feedNormalizer.ts` creates a unified post schema so the frontend only deals with one data format regardless of platform
- `filterEngine.ts` is the "baleen" core — filters content intelligently (exact logic TBD/to document)
- Threads API needs a live HTTPS server to complete OAuth — hence the GitHub push and Render deploy being prioritised

---

## 🌍 Environment Variables (keys only — never commit values)

```
# Add known .env keys here as they're created
# e.g.
# BLUESKY_IDENTIFIER=
# BLUESKY_PASSWORD=
# MASTODON_ACCESS_TOKEN=
# MASTODON_INSTANCE_URL=
# THREADS_APP_ID=
# THREADS_APP_SECRET=
```

---

## 📅 Session Log

| Date | What was done |
|------|--------------|
| Mar 13 2026 | Backend pushed to GitHub. node_modules cleanup. PROJECT_CONTEXT.md created. |

---

*Update this file at the end of every session. Ask Claude: "Update PROJECT_CONTEXT.md to reflect what we did today."*
