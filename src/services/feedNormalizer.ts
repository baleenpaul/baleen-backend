import { FeedItem } from "../utils/types";

/**
 * Normalize Bluesky feed to common FeedItem format
 * Extract images from embed.images array
 */
export function normalizeBskyFeed(rawFeed: any[]): FeedItem[] {
  return rawFeed.map((item) => {
    const post = item.post || item;

    // Extract images from embed
    const images: string[] = [];
    if (post.embed && post.embed.images && Array.isArray(post.embed.images)) {
      post.embed.images.forEach((img: any) => {
        // Images have thumb or fullsize directly (not nested under img.image)
        if (img.thumb) {
          images.push(img.thumb);
        } else if (img.fullsize) {
          images.push(img.fullsize);
        }
      });
    }

    // Extract links
    const links: string[] = [];
    if (post.facets && Array.isArray(post.facets)) {
      post.facets.forEach((facet: any) => {
        if (facet.features) {
          facet.features.forEach((feature: any) => {
            if (feature.$type === "app.bsky.richtext.facet#link" && feature.uri) {
              links.push(feature.uri);
            }
          });
        }
      });
    }

    return {
      id: post.uri || post.id,
      platform: "bluesky",
      author: post.author?.displayName || post.author?.handle || "Unknown",
      authorHandle: post.author?.handle || "unknown",
      text: post.record?.text || post.text || "",
      timestamp: post.record?.createdAt || post.createdAt || new Date().toISOString(),
      likeCount: post.likeCount || 0,
      repostCount: post.repostCount || 0,
      replyCount: post.replyCount || 0,
      images,
      links,
      liked: false,
      reposted: false,
      highlighted: false,
    };
  });
}

/**
 * Normalize Mastodon feed to common FeedItem format
 * Extract images from media_attachments array
 */
export function normalizeMastodonFeed(rawFeed: any[]): FeedItem[] {
  return rawFeed.map((post) => {
    // Extract images from media_attachments
    const images: string[] = [];
    if (post.media_attachments && Array.isArray(post.media_attachments)) {
      post.media_attachments.forEach((media: any) => {
        if (media.type === "image" && media.url) {
          images.push(media.url);
        } else if (media.preview_url) {
          images.push(media.preview_url);
        }
      });
    }

    // Extract links from content (HTML)
    const links: string[] = [];
    if (post.content) {
      const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
      const matches = post.content.match(urlRegex);
      if (matches) {
        links.push(...matches);
      }
    }

    // Strip HTML from content
    const cleanText = post.content
      ? post.content.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
      : "";

    return {
      id: post.id || post.url,
      platform: "mastodon",
      author: post.account?.display_name || post.account?.username || "Unknown",
      authorHandle: post.account?.username || "unknown",
      text: cleanText,
      timestamp: post.created_at || new Date().toISOString(),
      likeCount: post.favourites_count || 0,
      repostCount: post.reblogs_count || 0,
      replyCount: post.replies_count || 0,
      images,
      links,
      liked: post.favourited || false,
      reposted: post.reblogged || false,
      highlighted: false,
    };
  });
}

/**
 * Merge feeds with optional deduplication
 */
export function mergeFeedsWithDedup(
  bskyFeed: FeedItem[],
  mastodonFeed: FeedItem[],
  deduplicate: boolean = true
): FeedItem[] {
  const merged = [...bskyFeed, ...mastodonFeed];

  if (!deduplicate) {
    return merged;
  }

  // Deduplicate by text similarity + author
  // If two posts have very similar text and are within 24 hours, treat as duplicate
  const seen = new Map<string, FeedItem>();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  merged.forEach((item) => {
    // Create a simple hash from text and author
    const textHash = item.text.substring(0, 50).toLowerCase().replace(/\s+/g, " ");
    const key = `${textHash}_${item.author}`;

    // Keep the first occurrence, discard later duplicates
    if (!seen.has(key)) {
      const itemTime = new Date(item.timestamp).toISOString();
      if (itemTime > twentyFourHoursAgo) {
        seen.set(key, item);
      }
    }
  });

  return Array.from(seen.values());
}

/**
 * Get only posts with images
 */
export function filterPostsWithImages(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => item.images && item.images.length > 0);
}

/**
 * Sort by timestamp (newest first)
 */
export function sortByTimestamp(items: FeedItem[]): FeedItem[] {
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
