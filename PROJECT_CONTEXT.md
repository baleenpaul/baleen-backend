# Baleen Project Context

**Last Updated:** March 22, 2026 (Session 2)

## Quick Links
- **Frontend:** https://baleen-frontend.netlify.app (Netlify)
- **Backend:** https://baleen-backend.onrender.com (Render)
- **Frontend Repo:** https://github.com/baleenpaul/baleen-frontend
- **Backend Repo:** https://github.com/baleenpaul/baleen-backend

---

## Current Architecture

### Frontend Stack
- Next.js 14.2.35 + React 18 + Tailwind CSS
- Single `page.tsx` with three page states: `landing | feed | control`
- Whale image: `/public/images/whale.jpg` (bioluminescent AI-generated)

### Backend Stack
- Node.js v22 + TypeScript + Express
- Services: `blueskyClient.ts`, `mastodonClient.ts`, `feedNormalizer.ts`, `filterEngine.ts`
- Routes: GET `/feed`, POST `/feed/like`, POST `/feed/repost`, GET `/feed/filters`

### Integrated Platforms
- ✅ **Bluesky** - fully integrated, images working
- ✅ **Mastodon** - integrated, **images NOT working yet** (debugging in progress)
- 🔄 **Threads** - OAuth routing still returning 404 (not yet debugged in this session)
- 📋 **Twitter/X, Reddit, Substack** - UI placeholder only, not integrated

---

## Frontend: page.tsx Structure

### Landing Page (5 seconds)
- Whale image (whale.jpg) 
- IIB logo (teal gradient box)
- "Baleen" text (cyan-blue gradient)
- Tagline: "Unified Feed, without the noise"
- Fades out after 5s, melts into feed

### Live Feed
- Header: IIB + Baleen branding + Refresh button
- Posts from Bluesky + Mastodon (mixed chronologically by timestamp)
- Post structure:
  - Avatar: 36px initials circle (reduced from 48px this session)
  - Author + handle + timestamp + platform badge (🦋 Bluesky / 🐘 Mastodon)
  - Post text
  - Images grid (grid 2-column if multiple)
  - Stats: 💬 replies, 🔄 reposts, ❤️ likes
- Click logo → Control Panel

### Control Panel
- **Splash mode:** FILTER letters (F I L T E R) as glowing strands, feeds bubbles (f e e d s)
- **Filter mode:** 6 draggable bars (AI, Ad, W1, B1, B2, CU)
- **Feeds mode:** SM icons (🦋🐘🤖📰𝕏🧵) on left (100px now, was 80px), whale image + DROP FEED zone on right
- Click logo → Back to feed

### Styling Notes
- Teal ocean aesthetic: `#14b8a6` (logo), `#0d9488` (text accent)
- Cyan-blue gradient text: `linear-gradient(135deg, #00d9ff 0%, #0099ff 100%)`
- Platform badges: 20px emoji (enlarged 100% this session)
- Post avatars: 36px (reduced from 48px)
- SM source icons: 100px circles (enlarged from 80px)

---

## Backend: Feed Normalization

### FeedItem Type
```typescript
{
  id: string;
  cid?: string;                    // Bluesky only
  platform: 'bluesky' | 'mastodon';
  author: string;
  authorHandle: string;
  authorDid?: string;              // Bluesky only
  authorId?: string;               // Mastodon only
  text: string;
  timestamp: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  liked: boolean;                  // NEW (added this session)
  reposted: boolean;               // NEW (added this session)
  images: string[];
  links: any[];
}
```

### Feed Flow
1. **getBlueskyFeed()** → raw posts
2. **getMastodonFeed()** → raw posts
3. **normalizeBskyFeed()** → FeedItem[] (images from embed.images)
4. **normalizeMastodonFeed()** → FeedItem[] (images from media_attachments, trying preview_url | url | thumbnail_url)
5. **mergeFeedsWithDedup()** → sort by timestamp, optional dedup by text
6. Return in GET `/feed`

### Current Issue: Mastodon Images
- Backend is fetching Mastodon posts
- Image extraction logic added with fallbacks (preview_url → url → thumbnail_url)
- Debug logging added to see what's happening
- Need to check Render logs for: `📡 Fetching Mastodon feed...`, `✅ Mastodon fetched X posts`, `📸 First post has X media attachments`

---

## Deploy Commands

### Frontend
```bash
cd ~/Desktop/baleen-frontend
cp ~/Downloads/page.tsx src/app/page.tsx
git add src/app/page.tsx
git commit -m "message"
git push
```
Refresh: `Cmd + Shift + R`

### Backend
```bash
cd ~/Desktop/baleen-backend
cp ~/Downloads/[file].ts src/[path]/[file].ts
git add src/[path]/[file].ts
git commit -m "message"
git push
```
Wait 2-3 min for Render rebuild.

---

## Session History

### Session 1 (Previous)
- Built complete landing + feed + control panel architecture
- Integrated Bluesky + Mastodon feeds
- Styled with ocean/bioluminescent theme
- Deployed to Netlify + Render
- Added whale image to feeds page

### Session 2 (This Session - In Progress)
- ✅ Added landing page with whale + tagline
- ✅ Increased landing time to 5 seconds with fade-out
- ✅ Consistent IIB + Baleen branding across all pages
- ✅ Feed sorting chronologically to mix platforms
- ✅ Reduced post avatars (48px → 36px)
- ✅ Enlarged SM source icons (80px → 100px, emoji 32px → 40px)
- ✅ Enlarged platform badges (10px → 20px)
- 🔄 **Debugging Mastodon image extraction** - logs added, awaiting feedback

---

## Known Issues & Next Steps

### Priority 1: Mastodon Images
- Images not displaying despite media_attachments in API response
- Debug logs deployed to see URL extraction
- Action: Check Render logs for media attachment info

### Priority 2: Threads OAuth
- `/auth/threads/login` returns 404
- Files exist on GitHub (threadsClient.ts, auth.ts created earlier)
- Need to verify they're actually deployed on Render

### Nice-to-Have: Completed Features
- ✅ Whale image in control panel feeds mode
- ✅ Landing page splash
- ✅ Chronological feed mixing
- ✅ Responsive sizing

---

## Working Rules (from Paul's preferences)
1. **One step at a time** - no multi-feature changes
2. **Always repaste full files** - never just code snippets
3. **Always specify which file** being updated
4. **Download files automatically** after changes (no "download when you need it")
5. **Never modify splash page** without asking
6. **Show updated file** visually after edits

---

## File Locations
- Frontend: `/Users/paul/Desktop/baleen-frontend`
- Backend: `/Users/paul/Desktop/baleen-backend`
- Downloads: `~/Downloads/page.tsx`, `~/Downloads/feedNormalizer.ts`, etc.
