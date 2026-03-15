# 🎬 Baleen Video Integration Architecture

**Document Version:** 1.0  
**Date:** March 15, 2026  
**Status:** Planning Phase

---

## Executive Summary

Expand Baleen from **text-only social aggregator** to include **short-form video platforms**. This document outlines the architecture, implementation strategy, and technical requirements for integrating video feeds from Instagram Reels, YouTube Shorts, TikTok, and Twitter/X Videos.

---

## 1. Platform Comparison & Strategy

### Priority Matrix

| Platform | Difficulty | API Access | Auth | Revenue | Timeline | Priority |
|----------|-----------|-----------|------|---------|----------|----------|
| **Instagram Reels** | 🟢 Low | Meta Graph API | OAuth (Meta) | High | 2-3 weeks | **1st** |
| **YouTube Shorts** | 🟢 Low | YouTube Data API v3 | OAuth (Google) | High | 2-3 weeks | **2nd** |
| **Twitter/X Videos** | 🟡 Medium | X API v2 | OAuth (X) | Medium | 1-2 weeks | **3rd** |
| **TikTok** | 🔴 High | REST API (limited) | OAuth + server | Medium | 4-6 weeks | **4th** |
| **Bluesky Videos** | 🟡 Medium | ATProto | Existing auth | Low | 1-2 weeks | **5th** |

---

## 2. Data Model

### Video Item Type

```typescript
interface VideoItem {
  // Platform & identification
  platform: "instagram" | "youtube" | "tiktok" | "twitter" | "bluesky";
  id: string;
  url: string;
  
  // Content
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // May be restricted - use embed instead
  duration: number; // seconds
  
  // Creator
  author: string;
  authorHandle: string;
  authorAvatar: string;
  
  // Engagement
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  
  // Status
  liked: boolean;
  bookmarked: boolean;
  
  // Metadata
  timestamp: string;
  hashtags: string[];
  musicTrack?: string;
  
  // Platform-specific
  platformSpecific: Record<string, any>;
}
```

### Unified Feed Response

```typescript
interface UnifiedVideoFeed {
  videos: VideoItem[];
  platforms: ("instagram" | "youtube" | "tiktok" | "twitter" | "bluesky")[];
  totalCount: number;
  filters: {
    deduplicate: boolean;
    minDuration?: number;
    maxDuration?: number;
    sortBy: "newest" | "trending" | "mostLiked";
  };
}
```

---

## 3. Architecture Overview

### Backend Structure

```
src/
├── services/
│   ├── videoClients/
│   │   ├── instagramClient.ts
│   │   ├── youtubeClient.ts
│   │   ├── tiktokClient.ts
│   │   ├── twitterVideoClient.ts
│   │   └── blueskyVideoClient.ts
│   ├── feedNormalizer.ts (extended)
│   └── filterEngine.ts (extended)
├── routes/
│   ├── video.ts (new)
│   ├── auth.ts (extended)
│   └── feed.ts (existing)
├── utils/
│   ├── types.ts (extended)
│   └── cache.ts (new)
└── middleware/
    └── videoAuth.ts (new)
```

### Frontend Structure

```
src/
├── components/
│   ├── VideoFeed.tsx (new)
│   ├── VideoCard.tsx (new)
│   ├── VideoPlatformSelector.tsx (new)
│   └── VideoFilters.tsx (new)
├── pages/
│   ├── feed.tsx (text)
│   └── videos.tsx (new - video)
└── hooks/
    └── useVideoFeed.ts (new)
```

---

## 4. Authentication Strategy

### Multi-Platform OAuth

Each platform requires separate OAuth setup:

#### Instagram Reels (via Meta)
```
- Reuse THREADS_APP_ID and THREADS_APP_SECRET
- Permissions: instagram_basic, instagram_content
- Endpoint: /auth/instagram (can share with Threads)
```

#### YouTube Shorts
```
- New App: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET
- Permissions: youtube.readonly, youtube.upload (optional)
- Endpoint: /auth/youtube
- Scope: https://www.googleapis.com/auth/youtube.readonly
```

#### TikTok
```
- New App: TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET
- Permissions: video.list, user.info.basic
- Endpoint: /auth/tiktok
- Scope: video.list user.info.basic
```

#### Twitter/X Videos
```
- Reuse TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET (when implemented)
- Permissions: tweet.read, users.read
- Endpoint: /auth/twitter (can share with X text)
```

#### Bluesky Videos
```
- Reuse existing Bluesky credentials
- Videos are part of existing feed
- No new auth needed
```

### Storage Strategy
```typescript
interface VideoAuthToken {
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope: string[];
  userId: string;
}

// Store in: Database or Render env (for now, add DB later)
```

---

## 5. Platform-Specific Implementation Details

### 5.1 Instagram Reels

**API:** Meta Graph API  
**Endpoint:** `GET /me/media` with `media_type=REELS`  
**Rate Limit:** 200 calls/hour

```typescript
class InstagramVideoClient {
  async getReels(): Promise<VideoItem[]> {
    // Uses existing Meta OAuth from Threads
    // GET https://graph.instagram.com/me/media
    // ?fields=id,caption,media_type,timestamp,like_count,comments_count
    // &media_type=REELS
  }
  
  async likeReel(reelId: string): Promise<boolean> {
    // POST https://graph.instagram.com/{reel_id}/likes
  }
}
```

**Pros:**
- Shares auth infrastructure with Threads
- Well-documented API
- Good rate limits

**Cons:**
- Restricted permissions (requires business verification)
- Video URL restricted (must use embed)
- Limited engagement metrics

---

### 5.2 YouTube Shorts

**API:** YouTube Data API v3  
**Endpoint:** `GET /youtube/v3/search` filtered by videoDuration=short  
**Rate Limit:** 10,000 quota units/day

```typescript
class YouTubeVideoClient {
  async getShorts(): Promise<VideoItem[]> {
    // GET https://www.googleapis.com/youtube/v3/search
    // ?q=&videoDuration=short&type=video
    // &forMine=true&part=snippet,contentDetails,statistics
  }
  
  async likeVideo(videoId: string): Promise<boolean> {
    // POST https://www.googleapis.com/youtube/v3/videos/getRating
  }
}
```

**Pros:**
- Good API documentation
- Decent rate limits
- Direct video access (no embed restriction)
- Existing Google OAuth ecosystem

**Cons:**
- Requires separate Google OAuth flow
- "Shorts" is not officially an API category (use videoDuration filter)
- Rate limited by quota units, not calls

---

### 5.3 TikTok

**API:** TikTok REST API  
**Endpoint:** `GET /v1/video/query`  
**Rate Limit:** Highly restricted (100 requests/hour for free tier)

```typescript
class TikTokVideoClient {
  async getVideos(): Promise<VideoItem[]> {
    // Requires server-side auth (cannot use browser OAuth)
    // GET https://open.tiktokapis.com/v1/video/query/user_video
    // Complex: Requires TikTok to whitelist your server IP
  }
  
  async getVideoStats(videoId: string): Promise<VideoStats> {
    // GET /v1/video/query/video_detail?video_ids={videoId}
  }
}
```

**Pros:**
- Official REST API exists
- Huge platform reach

**Cons:**
- **Heavily restricted** - requires TikTok approval
- Server-side auth only (no browser OAuth)
- Very low rate limits (free tier)
- IP whitelisting required
- User engagement data restricted
- **Consider TikTok last or skip entirely**

---

### 5.4 Twitter/X Videos

**API:** X API v2  
**Endpoint:** `GET /2/users/:id/tweets` with `media_keys`  
**Rate Limit:** Depends on tier

```typescript
class TwitterVideoClient {
  async getVideoTweets(): Promise<VideoItem[]> {
    // GET https://api.twitter.com/2/users/{id}/tweets
    // ?expansions=author_id,attachments.media_keys
    // &media.fields=variants,duration_ms,preview_image_url
  }
}
```

**Pros:**
- Part of existing X integration
- Good API

**Cons:**
- Requires X API access tier
- Video variants (different qualities) require parsing

---

### 5.5 Bluesky Videos

**API:** ATProto (existing Bluesky auth)  
**Endpoint:** Feed already includes videos  
**Rate Limit:** Existing limits apply

```typescript
// Videos are part of existing blueskyClient.ts
// No new integration needed - just extend normalizer
class BlueskyVideoClient extends BlueskyClient {
  normalizeVideoPosts(feed): VideoItem[] {
    // Filter posts with video embeds
    // Extract video metadata
  }
}
```

**Pros:**
- No new auth needed
- Bluesky already sends videos in feed
- Simple implementation

**Cons:**
- Bluesky is smaller platform
- Limited video features

---

## 6. API Routes Design

### `/api/video` Endpoints

```typescript
// GET /api/video
// Fetch unified video feed from all platforms
GET /api/video
  ?platforms=instagram,youtube,tiktok
  &deduplicate=true
  &sortBy=newest
  &limit=30
Response: UnifiedVideoFeed

// GET /api/video/:platform
// Fetch videos from single platform
GET /api/video/instagram
  ?limit=20
Response: VideoItem[]

// POST /api/video/:platform/:videoId/like
// Like a video
POST /api/video/instagram/12345/like
Response: { success: boolean }

// POST /api/video/:platform/:videoId/bookmark
// Save video
POST /api/video/youtube/abc123/bookmark
Response: { success: boolean }

// GET /api/video/trending
// Trending videos across all platforms
GET /api/video/trending
  ?timeframe=24h
Response: VideoItem[]

// Auth endpoints (extend existing)
GET /api/auth/instagram/login
GET /api/auth/youtube/login
GET /api/auth/tiktok/login
```

---

## 7. Caching Strategy

### Why Caching Matters
- Video APIs are slow and quota-limited
- Videos don't change frequently
- User may refresh page multiple times

### Caching Layers

```typescript
interface CacheStrategy {
  instagram: {
    ttl: 60 * 60, // 1 hour
    maxItems: 50,
    key: "instagram_videos"
  },
  youtube: {
    ttl: 60 * 60 * 2, // 2 hours
    maxItems: 50,
    key: "youtube_videos"
  },
  tiktok: {
    ttl: 60 * 30, // 30 minutes (very restricted)
    maxItems: 30,
    key: "tiktok_videos"
  }
}
```

### Implementation
```typescript
// Use Redis or in-memory cache (depends on deployment)
class VideoCache {
  async getOrFetch(platform: string, userId: string) {
    const cached = await cache.get(`${platform}_${userId}`);
    if (cached && !isExpired(cached)) {
      return cached.data;
    }
    
    const fresh = await fetchFromPlatform(platform, userId);
    await cache.set(`${platform}_${userId}`, fresh, TTL[platform]);
    return fresh;
  }
}
```

---

## 8. Deduplication Strategy

### Problem
Same video might appear on multiple platforms (e.g., YouTube video shared to Twitter).

### Solution
```typescript
function deduplicateVideos(videos: VideoItem[]): VideoItem[] {
  const seen = new Map<string, VideoItem>();
  
  videos.forEach(video => {
    // Create hash from title + author + duration
    const hash = createHash(video.title, video.author, video.duration);
    
    if (!seen.has(hash)) {
      seen.set(hash, video);
    }
  });
  
  return Array.from(seen.values());
}
```

---

## 9. Frontend Implementation

### UI Components Needed

```typescript
// VideoFeed.tsx - Main container
<VideoFeed 
  platforms={["instagram", "youtube", "tiktok"]}
  sortBy="trending"
/>

// VideoCard.tsx - Individual video display
<VideoCard 
  video={videoItem}
  onLike={(videoId) => {}}
  onShare={(videoId) => {}}
/>

// VideoPlatformSelector.tsx - Toggle which platforms to show
<VideoPlatformSelector 
  available={["instagram", "youtube", "tiktok"]}
  selected={selectedPlatforms}
  onChange={setSelected}
/>

// VideoFilters.tsx - Filter options
<VideoFilters
  sortBy="trending"
  duration={{ min: 0, max: 60 }}
  onFilterChange={handleFilter}
/>
```

### Navigation

```typescript
// Two-tab layout
<Tabs>
  <Tab label="Text Feed" href="/feed" icon="📝" />
  <Tab label="Video Feed" href="/videos" icon="🎬" />
</Tabs>

// Or swipeable carousel (if mobile-first)
<SwipeableViews>
  <TextFeed />
  <VideoFeed />
</SwipeableViews>
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up data models (VideoItem, etc.)
- [ ] Create video route structure (`/api/video`)
- [ ] Implement basic caching layer
- [ ] Frontend: Create VideoCard component

**Deliverable:** Bare-bones video infrastructure ready

### Phase 2: Instagram Reels (Week 3-4)
- [ ] Create `instagramVideoClient.ts`
- [ ] Extend Meta OAuth to include Instagram permissions
- [ ] Implement video normalization
- [ ] Add like/bookmark functionality
- [ ] Test with real Instagram data

**Deliverable:** Instagram Reels feed working in Baleen

### Phase 3: YouTube Shorts (Week 5-6)
- [ ] Create YouTube OAuth flow
- [ ] Create `youtubeVideoClient.ts`
- [ ] Implement video search/filtering
- [ ] Add engagement metrics
- [ ] Test with real YouTube data

**Deliverable:** YouTube Shorts available alongside Instagram

### Phase 4: Twitter/X Videos (Week 7)
- [ ] Integrate with existing X API (when building X text)
- [ ] Create `twitterVideoClient.ts`
- [ ] Filter tweets with video content
- [ ] Normalize engagement data

**Deliverable:** X videos integrated into unified feed

### Phase 5: TikTok (Optional - Week 8+)
- [ ] Research TikTok API restrictions
- [ ] Request TikTok API access
- [ ] Create `tiktokVideoClient.ts`
- [ ] Handle server-side auth
- [ ] Test with real TikTok data

**Deliverable:** TikTok videos available (if API access granted)

### Phase 6: Polish (Week 9-10)
- [ ] Trending/discovery algorithms
- [ ] Advanced filtering
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Unit/integration testing

**Deliverable:** Production-ready video feed

---

## 11. Technical Considerations

### Rate Limiting Strategy

```typescript
const rateLimits = {
  instagram: { calls: 200, window: 3600 }, // per hour
  youtube: { quota: 10000, window: 86400 }, // quota units/day
  tiktok: { calls: 100, window: 3600 }, // per hour (limited)
};

// Implement token bucket or leaky bucket algorithm
class RateLimiter {
  async checkLimit(platform: string): Promise<boolean> {
    // Check if within limits before API call
  }
}
```

### Error Handling

```typescript
// All video clients should handle:
- API unavailability
- Rate limit exceeded
- Invalid tokens (refresh or re-auth)
- User not authorized for platform
- No videos available

// Return graceful errors to frontend
{
  error: "instagram_rate_limit",
  message: "Instagram API limit reached. Try again later.",
  retryAfter: 3600
}
```

### Token Refresh

```typescript
// Some platforms require token refresh (YouTube, TikTok)
class TokenManager {
  async refreshIfNeeded(platform: string) {
    const token = await getToken(platform);
    if (isExpiring(token)) {
      const newToken = await refreshToken(platform);
      await saveToken(platform, newToken);
    }
  }
}
```

---

## 12. Security Considerations

### API Keys & Secrets
- Store all API keys in **Render environment variables**
- Never commit to GitHub
- Rotate keys regularly

### User Data Privacy
- Don't store video metadata longer than necessary
- Clear cache when user logs out
- Respect platform ToS on data usage

### Rate Limiting
- Implement per-user rate limiting
- Prevent scraping by limiting historical data access

### OAuth Flow
- Validate state parameter (already doing this)
- Use PKCE for mobile if needed
- Secure token storage (HTTP-only cookies)

---

## 13. Deployment Strategy

### Environment Variables Needed

```env
# Instagram (via Meta)
INSTAGRAM_APP_ID=1295757872455812 (reuse from Threads)
INSTAGRAM_APP_SECRET=... (reuse from Threads)

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_API_KEY=...

# TikTok (if pursuing)
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_SERVER_IP=... (your Render IP)

# General
VIDEO_CACHE_TTL=3600
VIDEO_FEED_LIMIT=50
```

### Database Schema (if adding DB)

```sql
CREATE TABLE video_auth_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE TABLE video_cache (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## 14. Success Metrics

- ✅ All 4 major platforms integrated (Instagram, YouTube, TikTok, X)
- ✅ < 500ms average response time for video feed
- ✅ < 5% API error rate
- ✅ Unified UX across all platforms
- ✅ Mobile-friendly video display
- ✅ No data leaks or auth issues

---

## 15. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **TikTok API restrictions** | Can't build TikTok | Skip TikTok, focus on other 3 |
| **Rate limits hit quickly** | Service degrades | Implement smart caching + queuing |
| **Auth token expiration** | Users logged out | Auto-refresh tokens before expiry |
| **Video URL restrictions** | Can't embed videos | Use platform embed codes instead |
| **Performance issues** | Slow feed loading | Cache aggressively, lazy load videos |

---

## 16. Next Steps

1. **Get approval** from team/stakeholders on this architecture
2. **Set up Instagram permissions** in Meta for graph API access
3. **Create YouTube OAuth app** in Google Cloud Console
4. **Begin Phase 1** - Foundation work (data models, routes, caching)
5. **Parallel:** Get Meta Tech Provider approval for Threads (then reuse for Instagram)

---

## Appendix: API Reference Links

- [Meta Graph API (Instagram)](https://developers.facebook.com/docs/instagram-api)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [TikTok REST API](https://developers.tiktok.com/doc)
- [X API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Bluesky ATProto](https://github.com/bluesky-social/atproto)

---

**Document Status:** Ready for team review  
**Next Review:** After Meta Tech Provider approval  
**Owner:** Development Team
