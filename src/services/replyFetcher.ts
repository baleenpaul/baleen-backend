/**
 * Reply Fetcher Service
 * Fetches the first 10 replies from a post on Bluesky or Mastodon
 */

import axios from "axios";

const BSKY_API = "https://public.api.bsky.app/xrpc";
const blueskyAuthToken = process.env.BLUESKY_APP_PASSWORD;

const mastodonInstance = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";
const mastodonToken = process.env.MASTODON_ACCESS_TOKEN;

/**
 * Fetch replies from a Bluesky post
 */
export async function getBlueskyReplies(postUri: string): Promise<string[]> {
  if (!blueskyAuthToken) {
    console.warn("⚠️ Bluesky not authenticated");
    return [];
  }

  try {
    console.log(`📖 Fetching Bluesky replies for: ${postUri}`);
    const response = await axios.get(`${BSKY_API}/app.bsky.feed.getPostThread`, {
      params: {
        uri: postUri,
        depth: 1,
        limit: 10,
      },
      headers: { Authorization: `Bearer ${blueskyAuthToken}` },
    });

    const replies: string[] = [];
    
    if (response.data?.thread?.replies && Array.isArray(response.data.thread.replies)) {
      response.data.thread.replies.forEach((reply: any) => {
        if (reply.post?.record?.text) {
          replies.push(reply.post.record.text);
        }
      });
    }

    console.log(`📖 Got ${replies.length} Bluesky replies`);
    return replies;
  } catch (error) {
    console.error(`❌ Failed to fetch Bluesky replies:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch replies from a Mastodon post
 */
export async function getMastodonReplies(statusId: string): Promise<string[]> {
  if (!mastodonToken) {
    console.warn("⚠️ Mastodon not authenticated");
    return [];
  }

  try {
    console.log(`📖 Fetching Mastodon replies for: ${statusId}`);
    const response = await axios.get(
      `${mastodonInstance}/api/v1/statuses/${statusId}/context`,
      {
        headers: { Authorization: `Bearer ${mastodonToken}` },
      }
    );

    const replies: string[] = [];

    if (response.data?.descendants && Array.isArray(response.data.descendants)) {
      // Take first 10 descendants, strip HTML
      response.data.descendants.slice(0, 10).forEach((reply: any) => {
        if (reply.content) {
          const cleanText = reply.content.replace(/<[^>]*>/g, "");
          replies.push(cleanText);
        }
      });
    }

    console.log(`📖 Got ${replies.length} Mastodon replies`);
    return replies;
  } catch (error) {
    console.error(`❌ Failed to fetch Mastodon replies:`, error instanceof Error ? error.message : error);
    return [];
  }
}
