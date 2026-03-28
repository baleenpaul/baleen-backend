import { FeedItem } from "../utils/types";

export function normalizeBskyFeed(rawFeed: any[]): FeedItem[] {
  return rawFeed.map((item) => {
    const post = item.post || item;

    // Extract images from embed
    const images: string[] = [];
    if (post.embed && post.embed.images && Array.isArray(post.embed.images)) {
      post.embed.images.forEach((img: any) => {
        if (img.thumb) {
          images.push(img.thumb);
        } else if (img.fullsize) {
          images.push(img.fullsize);
        }
      });
    }

    // Extract links from facets
    const links: Array<{url: string; title?: string}> = [];
    if (post.record?.facets && Array.isArray(post.record.facets)) {
      post.record.facets.forEach((facet: any) => {
        if (facet.features && Array.isArray(facet.features)) {
          facet.features.forEach((feature: any) => {
            if (feature.$type === "app.bsky.richtext.facet#link" && feature.uri) {
              links.push({url: feature.uri});
            }
          });
        }
      });
    }

    return {
      id: post.uri || post.id,
      cid: post.cid,
      platform: "bluesky",
      author: post.author?.displayName || post.author?.handle || "Unknown",
      authorHandle: post.author?.handle || "unknown",
      authorDid: post.author?.did,
      text: post.record?.text || post.text || "",
      timestamp: post.record?.createdAt || post.createdAt || new Date().toISOString(),
      likeCount: post.likeCount || 0,
      repostCount: post.repostCount || 0,
      replyCount: post.replyCount || 0,
      liked: false,
      reposted: false,
      images,
      links,
    };
  });
}

export function normalizeMastodonFeed(rawFeed: any[]): FeedItem[] {
  return rawFeed.map((post: any) => {
    const images: string[] = [];
    
    // Check main post media_attachments
    if (post.media_attachments && Array.isArray(post.media_attachments)) {
      post.media_attachments.forEach((media: any) => {
        const imageUrl = media.preview_url || media.url || media.thumbnail_url;
        if (imageUrl) {
          images.push(imageUrl);
        }
      });
    }
    
    // Check reblog media_attachments
    if (post.reblog?.media_attachments && Array.isArray(post.reblog.media_attachments)) {
      post.reblog.media_attachments.forEach((media: any) => {
        const imageUrl = media.preview_url || media.url || media.thumbnail_url;
        if (imageUrl) {
          images.push(imageUrl);
        }
      });
    }
    
    // Check card (link preview) image
    if (post.card?.image) {
      images.push(post.card.image);
    }

    // Extract links from card
    const links: Array<{url: string; title?: string}> = [];
    if (post.card?.url) {
      links.push({
        url: post.card.url,
        title: post.card.title
      });
    }

    // Clean HTML from text
    const cleanText = post.content
      ? post.content.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      : "";

    return {
      id: post.id || post.url,
      platform: "mastodon",
      author: post.account?.display_name || post.account?.username || "Unknown",
      authorHandle: post.account?.username || "unknown",
      authorId: post.account?.id,
      text: cleanText,
      timestamp: post.created_at || new Date().toISOString(),
      likeCount: post.favourites_count || 0,
      repostCount: post.reblogs_count || 0,
      replyCount: post.replies_count || 0,
      liked: false,
      reposted: false,
      images,
      links,
    };
  });
}

export function mergeFeedsWithDedup(bskyFeed: FeedItem[], mastodonFeed: FeedItem[], deduplicate: boolean = true): FeedItem[] {
  const merged = [...bskyFeed, ...mastodonFeed];
  
  if (!deduplicate) return merged;

  const seen = new Set<string>();
  return merged.filter((item) => {
    const key = item.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeFeed(blueskyFeed: any[], mastodonFeed: any[]): FeedItem[] {
  const normalizedBsky = normalizeBskyFeed(blueskyFeed);
  const normalizedMastodon = normalizeMastodonFeed(mastodonFeed);
  return [...normalizedBsky, ...normalizedMastodon];
}
