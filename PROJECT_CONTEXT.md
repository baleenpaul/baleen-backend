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
- 🔄 Threads (in progress — OAuth flow routing issue)
- ⬜ Twitter/X (TBD)
---
## 📁 Backend File Structure
