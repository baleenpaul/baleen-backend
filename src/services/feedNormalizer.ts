import { FeedItem } from "../utils/types";

export function normalizeBskyFeed(bskyFeed: any[]): FeedItem[] {
  return bskyFeed.map((post) => {
    const record = post.post.record;
    return {
      platform: "bluesky",
      id: post.post.uri,
      text: record.text,
      author: post.post.author.displayName || post.post.author.handle,
      authorHandle: post.post.author.handle,
      timestamp: record.createdAt,
      images: (record.embed?.images || []).map((img: any) => img.image.thumb),
      links: extractLinks(record.text),
      likeCount: post.post.likeCount || 0,
      repostCount: post.post.repostCount || 0,
      liked: post.post.viewer?.like ? true : false,
      reposted: post.post.viewer?.repost ? true : false,
      quotedPost: post.reply?.parent || null,
    };
  });
}

export function normalizeMastodonFeed(mastodonFeed: any[]): FeedItem[] {
  return mastodonFeed.map((post) => {
    return {
      platform: "mastodon",
      id: post.id,
      text: stripHtml(post.content),
      author: post.account.display_name || post.account.username,
      authorHandle: post.account.acct,
      timestamp: post.created_at,
      images: post.media_attachments
        .filter((m: any) => m.type === "image")
        .map((m: any) => m.preview_url || m.url),
      links: extractLinks(stripHtml(post.content)),
      likeCount: post.favourites_count || 0,
      repostCount: post.reblogs_count || 0,
      liked: post.favourited || false,
      reposted: post.reblogged || false,
      quotedPost: post.in_reply_to_id ? { id: post.in_reply_to_id } : null,
    };
  });
}

export function mergeFeedsWithDedup(
  bskyItems: FeedItem[],
  mastodonItems: FeedItem[],
  deduplicate: boolean
): FeedItem[] {
  let allItems = [...bskyItems, ...mastodonItems];

  if (deduplicate) {
    const seen = new Map<string, FeedItem>();
    const now = Date.now();
    const window24h = 24 * 60 * 60 * 1000;

    allItems.forEach((item) => {
      const key = `${item.authorHandle}-${normalizeText(item.text)}`;
      const existing = seen.get(key);

      if (!existing) {
        seen.set(key, item);
      } else {
        // Keep if newer, or first occurrence if within 24h
        const existingTime = new Date(existing.timestamp).getTime();
        const currentTime = new Date(item.timestamp).getTime();
        const timeDiff = Math.abs(currentTime - existingTime);

        if (timeDiff < window24h && currentTime < existingTime) {
          seen.set(key, item); // Replace with older one
        }
      }
    });

    allItems = Array.from(seen.values());
  }

  return allItems.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function extractLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}
