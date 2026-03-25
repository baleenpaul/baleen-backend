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
    const url = `${mastodonInstance}/api/v1/statuses/${statusId}/context`;
    console.log(`📖 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${mastodonToken}` },
    });

    console.log(`📖 Response status: ${response.status}`);
    console.log(`📖 descendants array length: ${response.data?.descendants?.length || 0}`);

    if (!response.data?.descendants) {
      console.log(`📖 No descendants field in response`);
      console.log(`📖 Response keys: ${Object.keys(response.data).join(', ')}`);
    }

    const replies: string[] = [];

    if (response.data?.descendants && Array.isArray(response.data.descendants)) {
      console.log(`📖 Processing ${response.data.descendants.length} descendants`);
      response.data.descendants.slice(0, 10).forEach((reply: any, idx: number) => {
        if (reply.content) {
          const cleanText = reply.content.replace(/<[^>]*>/g, "");
          console.log(`📖 Reply ${idx}: "${cleanText.substring(0, 50)}..."`);
          replies.push(cleanText);
        } else {
          console.log(`📖 Reply ${idx}: No content field`);
        }
      });
    } else {
      console.log(`📖 descendants is not an array or missing`);
    }

    console.log(`📖 Got ${replies.length} Mastodon replies`);
    return replies;
  } catch (error) {
    console.error(`❌ Failed to fetch Mastodon replies:`, error instanceof Error ? error.message : error);
    if (error instanceof Error && 'response' in error) {
      console.error(`❌ Response status: ${(error as any).response?.status}`);
      console.error(`❌ Response data: ${JSON.stringify((error as any).response?.data)}`);
    }
    return [];
  }
}
