# Baleen Project Context - March 29, 2026

## Current Status
- **Backend**: Node.js/TypeScript/Express on Render
- **Frontend**: Next.js 14 + React + Tailwind on Netlify
- **Connected Platforms**: Mastodon ✅, Bluesky 🚨 (UI works, no feed)
- **Authentication**: Full JWT + credential encryption system ✅

## Session 7 (Mar 29) - COMPLETED ✅

### 🎉 User Authentication System Fully Integrated

#### ✅ Backend Complete
1. **PostgreSQL Database on Render**
   - Free tier (expires Apr 27, 2026)
   - Tables: `users` + `credentials` with encrypted storage
   - Migration: `src/migrate.ts` - creates schema successfully

2. **Auth Endpoints - ALL WORKING** ✅
   - `POST /auth/signup` - Register user, returns JWT ✅
   - `POST /auth/login` - Login, returns JWT ✅
   - `POST /auth/add-credential` - Add/update SM credentials (JWT required) ✅
   - `GET /auth/credentials` - Fetch connected platforms (JWT required) ✅

3. **Utilities Created** ✅
   - `src/utils/db.ts` - PostgreSQL connection pool
   - `src/utils/password.ts` - bcrypt hashing
   - `src/utils/jwt.ts` - JWT generation/verification
   - `src/utils/encryption.ts` - AES-256 credential encryption
   - `src/utils/auth-types.ts` - TypeScript interfaces
   - `src/routes/auth.ts` - All auth endpoints with middleware

#### ✅ Frontend Complete
1. **Auth Pages** ✅
   - `/login` - Login form with JWT storage
   - `/signup` - Signup with validation
   - Both redirect to `/` (live feed) after success

2. **Feed Sources Page (`/feeds`)** ✅
   - Drag-and-drop SM icons (🦋 Bluesky, 🐘 Mastodon)
   - `CredentialModal` opens on drop
   - User enters handle + app password/token
   - Credentials encrypted and stored in database
   - Modal shows success feedback
   - "Go to Feed" button navigates back to `/` (live feed)
   - File: `src/app/feeds/page.tsx`

3. **Control Panel Navigation** ✅
   - "FEEDS" bubble on splash/control panel navigates to `/feeds` route
   - `/feeds` "Go to Feed" button navigates back to `/`
   - Full circular navigation working
   - File: `src/app/page.tsx` - Updated `goToFeedPage()` to use `router.push('/feeds')`

#### ✅ Test Results
```
✅ Signup: User created, JWT returned
✅ Login: Authentication successful
✅ Credentials modal: Opens on drag-drop
✅ Credential storage: Encrypted and saved to DB
✅ Navigation: /feeds ↔ / working seamlessly
✅ Mastodon feed: Shows posts correctly
```

### 🚨 CRITICAL ISSUE: Bluesky Not Connected
**Status**: Credentials can be added, but **no Bluesky posts appear in live feed**
- Mastodon feed works correctly
- Bluesky modal/credential storage works
- Bluesky feed is empty even when credentials added
- **Root cause**: Unclear - likely backend issue with Bluesky client or feed fetching
- **Investigation needed**:
  1. Check `src/services/blueskyClient.ts` - is it using stored user credentials?
  2. Check `src/routes/feed.ts` - is it fetching from Bluesky at all?
  3. Check Bluesky API authentication - app password working?
  4. Check database - are credentials actually being stored/retrieved?

### 🚨 Secondary Issues

1. **Interaction Endpoints Need User Credentials**
   - Like/repost buttons exist but don't work
   - Backend needs to be updated to:
     - Extract user ID from JWT
     - Fetch user's stored credentials from DB
     - Decrypt and use credentials (not dev credentials)
   - Files: `src/routes/interactions.ts`

2. **Feed Sort Not Working on Render**
   - Sort code exists in `feed.ts` but appears to silently fail
   - Works locally, fails on Render
   - May be async issue or permission issue

## Key Files Updated This Session

| File | Change |
|------|--------|
| `src/app/page.tsx` | Added `useRouter` import, updated `goToFeedPage()` to navigate to `/feeds` |
| `src/app/feeds/page.tsx` | Complete rewrite - added "Go to Feed" button, cleaned up JSX |
| All auth files | Already complete from earlier in session |

## Next Session Priorities

1. **🚨 DEBUG BLUESKY FEED** - Most critical
   - Why are no Bluesky posts showing?
   - Credentials are being stored - check if they're being used for fetches

2. **Wire interaction endpoints** - Use stored user credentials for likes/reposts

3. **Fix chronological sort** - Works locally, fails on Render

4. **PostgreSQL cleanup** - Free tier expires Apr 27, plan migration or upgrade

## Deployment Status
- ✅ Backend: Auto-deploys to Render on push
- ✅ Frontend: Auto-deploys to Netlify on push
- Both live and functional (except Bluesky feed issue)
