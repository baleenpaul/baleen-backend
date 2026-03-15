# 🐋 Project Context & Progress Log - Baleen

**Last Updated:** March 15, 2026, 4:40 PM UTC

---

## 🐋 Project Overview

Baleen is a unified, beautifully-designed social media aggregator and cross-poster with intelligent filtering.

* **Goal:** One interface to read, filter, and post across multiple social platforms
* **Name inspiration:** Baleen whales filter-feed — the app filters your social feeds
* **Backend repo:** https://github.com/baleenpaul/baleen-backend
* **Frontend repo:** https://github.com/baleenpaul/baleen-frontend
* **Policy repo:** https://github.com/baleenpaul/baleen-policy
* **Live site:** https://baleen-frontend.netlify.app

---

## 🛠 Tech Stack

### Backend (`baleen-backend`)
* **Runtime:** Node.js v22
* **Language:** TypeScript
* **Framework:** Express
* **Deployed:** Render — https://baleen-backend.onrender.com
* **Status:** ✅ Live and fully functional

### Frontend (`baleen-frontend`)
* **Framework:** Next.js 14.2.35 with React 18 and Tailwind CSS
* **Deployed to:** Netlify — https://baleen-frontend.netlify.app
* **Status:** ✅ Live and fully functional

---

## 📱 Platform Integration Status

### ✅ Bluesky
* **Client:** `src/services/blueskyClient.ts`
* **Status:** Fully integrated and working
* **Authentication:** Service account (environment-based credentials)
* **Feed:** Fetching + normalizing ✅
* **Actions:** Like, repost ✅

### ✅ Mastodon
* **Client:** `src/services/mastodonClient.ts`
* **Status:** Fully integrated and working
* **Authentication:** Static access token
* **Feed:** Fetching + normalizing ✅
* **Actions:** Like, repost ✅

### 🔄 Threads (In Progress - OAuth Flow)
* **Client:** `src/services/threadsClient.ts`
* **Status:** OAuth routing **fixed**, awaiting Meta approval
* **Authentication:** OAuth 2.0 flow
* **Routes:** `/auth/threads/login`, `/auth/threads/callback` ✅

---

## 🔧 Recent Fixes: Threads OAuth Routing Issue

### Root Cause Identified
The Threads OAuth was failing due to **multiple configuration issues**:

1. **Wrong App ID in `.env`**
   - Was using: Profile URL (`https://www.threads.com/@builtbadpaul`)
   - Should be: Threads App ID (`1581961063067972`)
   - **Status:** ✅ Fixed

2. **Missing Token Persistence**
   - Token was acquired but not stored for API requests
   - **Status:** ✅ Fixed in `src/routes/auth.ts`

3. **Meta App Credentials Mismatch**
   - Initially used general Meta App ID instead of Threads-specific ID
   - **Status:** ✅ Corrected to use Threads App ID

4. **Missing OAuth Redirect URI Configuration**
   - Meta required full callback URL registered
   - **Status:** ✅ Added to Meta app settings

5. **Permissions Not Activated**
   - `threads_basic_access` and `threads_content_publish` were "Ready for testing"
   - Required Tech Provider verification to submit for review
   - **Status:** 🔄 **Tech Provider verification submitted** (awaiting Meta approval)

### Files Updated
* **`.env` & `.env.save`** — Updated with correct Threads App ID and secret
* **`src/routes/auth.ts`** — Fixed OAuth callback with:
  - Proper token persistence (secure HTTP-only cookie)
  - Error handling for Threads error responses
  - Better logging for debugging
  - Added logout endpoint
* **Render Environment** — Variables updated with correct credentials

### Current Status
- ✅ OAuth redirect working (user sees Threads login page)
- ✅ User authentication succeeds
- ✅ Test user role assigned and accepted
- 🔄 **Awaiting Meta Tech Provider approval** (1-7 business days)
- ⏳ Once approved: Will submit permissions for App Review
- ⏳ Once approved: Full OAuth flow will be operational

---

## 🚀 Next Steps

### Immediate (While waiting for Meta approval)
1. **Integrate Threads feed into `/feed` endpoint**
   - Create `normalizeThreadsFeed()` in `feedNormalizer.ts`
   - Add Threads feed fetching to `/feed` route
   - Test with mock data if needed

2. **Add Threads actions support**
   - Extend `feed.ts` to handle Threads like/repost in POST endpoints

3. **Frontend integration**
   - Add "Connect Threads" button to auth UI
   - Handle `?threads=connected` query param
   - Display Threads posts in unified feed

### When Meta Approval Arrives
1. Activate Threads OAuth fully
2. End-to-end testing
3. Deploy updates

### Future Platforms
* ⬜ Twitter/X (TBD)
* Any others?

---

## 📋 Architecture Notes

### Authentication Patterns
- **Bluesky:** Service account (static credentials, no OAuth)
- **Mastodon:** Static token (no OAuth)
- **Threads:** User OAuth flow (token stored in secure cookie)

### Feed Normalization
All feeds normalize to `FeedItem[]` type in `utils/types.ts`:
```typescript
interface FeedItem {
  platform: "bluesky" | "mastodon" | "threads";
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  timestamp: string;
  images: string[];
  links: string[];
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
  quotedPost: any | null;
}
```

### Filtering Engine
- `filterEngine.ts` applies muting and highlighting
- Mute keywords: "trump", "bitcoin", "football"
- Highlight keywords: "ireland", "climate", "housing"
- Can be made configurable later

---

## 🔐 Security Notes

### Secret Management
- **GitGuardian alert:** App secret exposed in commit (March 15, 2026 12:39 UTC)
- ✅ **Fixed:** Secret reset in Meta, updated in Render and local `.env`
- All credentials now properly managed

### OAuth Security
- CSRF protection via state parameter ✅
- Secure HTTP-only cookies ✅
- Token expiration handling needed (TODO)

---

## 📝 Known Issues & TODOs

### Threads OAuth
- [ ] Wait for Meta Tech Provider approval (1-7 days)
- [ ] Submit permissions for App Review once approved
- [ ] Full end-to-end testing once approved

### General
- [ ] Token refresh logic for Threads (access tokens expire)
- [ ] Database integration for persistent token storage
- [ ] Rate limiting on API endpoints
- [ ] Better error messages for users

---

## 🎯 Success Metrics

- ✅ Bluesky feed working
- ✅ Mastodon feed working
- 🔄 Threads OAuth routing fixed (awaiting approval)
- ⏳ Threads feed integration (pending OAuth approval)
- ⬜ Twitter/X integration (TBD)

---

## 📞 Contact & Notes

**Developer:** Paul McNally (@builtbadpaul on Threads)  
**Last Session:** Resolved Threads OAuth routing — submitted Tech Provider verification  
**Next Session:** Check Meta approval status, integrate Threads feed, or work on other features

---

**🐋 Keep building!**
