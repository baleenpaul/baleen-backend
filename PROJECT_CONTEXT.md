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

## Session 7 (Mar 28) - IN PROGRESS

### 🚨 BLOCKING ISSUE: User Authentication System Not Yet Built

**Problem**: Cannot continue building/testing interaction features without user auth.

Current state:
- Backend fetches feed using **developer credentials** (env vars)
- Interaction endpoints require **user authentication tokens**
- No user signup/login system exists
- No way for users to store their SM platform credentials
- Like/repost buttons fail silently because they have no auth token

**Cannot proceed with testing interactions until this is fixed.**

### NEXT: Build User Authentication System

#### Phase 1: Backend User System
1. **Database Schema**
   - Users table: id, username, email, password_hash
   - Credentials table: userId, platform (bluesky|mastodon), handle, token/password (encrypted)

2. **Auth Endpoints**
   - `POST /auth/signup` - Register user
   - `POST /auth/login` - Authenticate, return JWT
   - `POST /auth/add-credential` - User adds Bluesky app password or Mastodon token
   - `GET /auth/credentials` - Get user's connected platforms

3. **Update Interaction Endpoints**
   - Add JWT verification middleware
   - Update `/interactions/like` and `/interactions/repost` to:
     - Extract user ID from JWT
     - Fetch user's stored credentials from database
     - Use user's credentials (not dev credentials) for API calls

#### Phase 2: Frontend Auth UI
1. Signup/login pages
2. Credential management page (add Bluesky & Mastodon accounts)
3. Auth state management (JWT storage, session handling)

#### Timeline to Restore Functionality
1. Build user system (backend)
2. Build login UI (frontend)
3. Log in with your account
4. Add your Bluesky + Mastodon credentials
5. Like/repost buttons will use YOUR credentials
6. All interaction features can be tested

### 🚨 Not Yet Started
1. **Frontend interaction buttons** - No UI to call the new like/repost endpoints
2. **Error handling** - Like/repost endpoints need token auth (user not yet logged in)

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
