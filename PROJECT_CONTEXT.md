# Baleen Project Context - March 28, 2026

## Current Status
- **Backend**: Node.js/TypeScript/Express on Render
- **Frontend**: Next.js 14 + React + Tailwind on Netlify
- **Connected Platforms**: Bluesky ✅, Mastodon ✅

## Session 5 (Mar 27-28) - Completed

### ✅ Done
1. **Link extraction** - Backend now extracts links from:
   - Bluesky: `post.record.facets` (richtext links)
   - Mastodon: `post.card.url` (link previews)
   - Updated `FeedItem` type: `links: Array<{url: string; title?: string}>`
   - File: `src/services/feedNormalizer.ts`

2. **Interaction endpoints** - Added to `src/routes/interactions.ts`:
   - `POST /interactions/like` - Like/unlike posts (Bluesky + Mastodon)
   - `POST /interactions/repost` - Repost/unrepost (Bluesky) + boost/unboost (Mastodon)
   - Both use platform-specific client functions that already existed

3. **Frontend UI changes**:
   - Platform bubbles (Reddit, Substack, Twitter, Threads) → "Coming soon" disabled
   - Loading message → "Filtering feed"
   - Logo added to repo

## Session 6 (Mar 28) - Completed

### ✅ Done
1. **Chronological feed sort** - Client-side sort now working. Posts from Bluesky + Mastodon are interleaved by timestamp (newest first).

2. **Frontend link rendering** - LinkCard component displays extracted links:
   - File: `src/app/components/LinkCard.tsx`
   - Renders links below post images
   - Styled with cyan theme, hover effects

3. **Embedded posts extraction** - Backend extracts quoted posts from Bluesky and reblogs from Mastodon

4. **Interactive Like and Repost buttons** - Frontend components created
   - Files: `src/app/components/LikeButton.tsx`, `src/app/components/RepostButton.tsx`
   - Buttons render but don't execute (see blocking issue below)

## Session 7 (Mar 28) - COMPLETED ✅

### 🎉 User Authentication System Built

#### ✅ Backend Infrastructure
1. **PostgreSQL Database on Render**
   - Free tier (expires Apr 27, 2026)
   - Tables: `users` (id, username, email, password_hash, created_at) + `credentials` (user_id, platform, handle, token_encrypted, created_at)
   - Migration script: `src/migrate.ts` successfully creates schema
   - External URL: `postgresql://baleen_user:...@dpg-d740m6ma2pns73aeon90-a.frankfurt-postgres.render.com/baleen?sslmode=require`

2. **Auth Endpoints - ALL WORKING** ✅
   - `POST /auth/signup` - Register user, returns JWT ✅ **TESTED AND WORKING**
   - `POST /auth/login` - Login with username/password, returns JWT
   - `POST /auth/add-credential` - Add SM platform credentials (requires JWT)
   - `GET /auth/credentials` - Get user's connected platforms (requires JWT)

3. **Utility Files Created**
   - `src/utils/db.ts` - Database connection pool
   - `src/utils/password.ts` - Password hashing with bcrypt
   - `src/utils/jwt.ts` - JWT token generation/verification
   - `src/utils/encryption.ts` - AES-256 encryption for storing credentials
   - `src/utils/auth-types.ts` - TypeScript interfaces

4. **Auth Middleware**
   - JWT verification on protected routes
   - Credential encryption/decryption (AES-256)

#### ✅ Test Results
```
POST https://baleen-backend.onrender.com/auth/signup
Input: {"username":"paul","email":"paul@baleen.com","password":"testpass123"}

Response: ✅ SUCCESS
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "paul",
    "email": "paul@baleen.com",
    "created_at": "2026-03-28T18:02:54.532Z"
  }
}
```

### NEXT: Frontend Auth UI + Whale Integration

#### Phase 2: Frontend (Ready to Build)
1. **Login/Signup Pages**
   - Simple forms for username/password
   - Store JWT token in localStorage
   - Redirect to feeds page on success

2. **Whale Drop → Add Credential Modal**
   - User drags SM icon to whale mouth → opens modal
   - Modal form: platform selector + handle + token/app-password inputs
   - Calls `POST /auth/add-credential` with JWT token
   - Shows list of connected platforms after submission

3. **Update Interaction Endpoints**
   - Modify `/interactions/like` and `/interactions/repost` to:
     - Extract user ID from JWT
     - Fetch user's stored credentials from DB
     - Decrypt and use user's credentials (not dev credentials)

#### Expected User Workflow
1. User signs up at Baleen login page
2. User logs in, JWT token stored in browser
3. User sees feeds page + whale drop interface
4. User drags Bluesky icon to whale mouth
5. Modal opens: enter Bluesky handle + app password
6. Credentials encrypted and stored in database
7. User can now like/repost with their own credentials
8. Repeat for Mastodon

### ✅ All Backend Auth Done
- ✅ Signup working
- ✅ Login ready
- ✅ Credential storage ready
- ✅ Database schema ready

### ⏳ Not Yet Started
1. **Frontend login/signup UI** 
2. **Whale drop → credential modal** wiring
3. **Update interaction endpoints** to use user's stored credentials

## Architecture Overview

### Backend Flow (Current)
```
GET /feed?sensitivity=50
  ├─ Fetch Bluesky + Mastodon feeds
  ├─ Normalize (extract images + links)
  ├─ Merge + dedup
  ├─ Sort (attempted but broken)
  ├─ Enrich with AI detection (scan replies for AI keywords)
  ├─ Apply sensitivity filter
  └─ Return FeedItem[]
```

### FeedItem Structure (Updated)
```typescript
{
  id: string;
  platform: "bluesky" | "mastodon";
  author: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  images: string[];
  links: Array<{url: string; title?: string}>;  // ← NEW
  likeCount: number;
  repostCount: number;
  replyCount: number;
  liked: boolean;
  reposted: boolean;
  aiScore: number;
  aiWarning: boolean;
  aiBlocked: boolean;
  aiEvidence: string[];
}
```

## API Endpoints

### Feed
- `GET /feed?sensitivity=0-100` → Unified feed

### Interactions (NEW)
- `POST /interactions/like` - Like/unlike post
- `POST /interactions/repost` - Repost/unrepost post
- `POST /interactions/reply` - Reply to post (existing)
- `POST /interactions/follow` - Follow user (existing)
- `GET /interactions/comments/:platform/:postId` - Fetch replies (existing)

## Frontend Structure
- `src/app/page.tsx` - Main page, all routes in one file
- Filter bars (sensitivity slider)
- Feed display (posts)
- Platform bubbles (feed sources)

## Next Session: Build Interaction UI

### Priority 1: Link Cards
- [ ] Create LinkCard component
- [ ] Render `post.links` in feed
- [ ] Link opens in new tab

### Priority 2: Interaction Buttons
- [ ] Like button (calls `POST /interactions/like`)
- [ ] Repost button (calls `POST /interactions/repost`)
- [ ] Update local state on success
- [ ] Need user auth token (TBD)

### Priority 3: Deep Links
- [ ] Make post clickable → opens original on platform
- [ ] Format: bluesky.app/profile/.../post/... or mastodon.social/@.../...

### Technical Debt
- Chronological sort not working (backend issue)
- No user authentication for interactions
- Frontend needs refactor (all in page.tsx)

## Files to Know
- **Backend routes**: `src/routes/feed.ts`, `src/routes/interactions.ts`
- **Backend services**: `src/services/blueskyClient.ts`, `src/services/mastodonClient.ts`
- **Normalizer**: `src/services/feedNormalizer.ts` (link extraction here)
- **Frontend**: `src/app/page.tsx` (entire UI)

## Deployment
- Backend: Push to GitHub → Render auto-deploys
- Frontend: Push to GitHub → Netlify auto-deploys
- Both rebuild in ~2 min

## Working Rules
1. Always present files BEFORE terminal commands
2. Specify TERMINAL vs BROWSER CONSOLE
3. One change at a time
4. Use `/home/claude/` or `~/Downloads/` (not `/mnt/user-data/outputs/`)
