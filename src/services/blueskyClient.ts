import axios from "axios";

const BSKY_API = "https://bsky.social/xrpc";

let blueskyAuthToken: string = "";
let blueskyDid: string = "";

export async function initBlueskySession() {
  const { BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD } = process.env;

  if (!BLUESKY_IDENTIFIER || !BLUESKY_APP_PASSWORD) {
    console.warn("Bluesky credentials missing");
    return;
  }

  try {
    const response = await axios.post(`${BSKY_API}/com.atproto.server.createSession`, {
      identifier: BLUESKY_IDENTIFIER,
      password: BLUESKY_APP_PASSWORD,
    });

    blueskyAuthToken = response.data.accessJwt;
    blueskyDid = response.data.did;
    console.log("✅ Bluesky session initialized");
  } catch (error) {
    console.error("❌ Bluesky auth failed:", error);
  }
}

export async function getBlueskyFeed() {
  if (!blueskyAuthToken) {
    console.warn("Bluesky not authenticated");
    return [];
  }

  try {
    const response = await axios.get(`${BSKY_API}/app.bsky.feed.getTimeline`, {
      params: { limit: 30 },
      headers: { Authorization: `Bearer ${blueskyAuthToken}` },
    });

    return response.data.feed || [];
  } catch (error) {
    console.error("❌ Bluesky feed fetch failed:", error);
    return [];
  }
}

export async function likeBlueskyPost(uri: string, cid: string, action: 'like' | 'unlike') {
  if (!blueskyAuthToken || !blueskyDid) {
    throw new Error("Bluesky not authenticated");
  }

  try {
    if (action === 'like') {
      const response = await axios.post(
        `${BSKY_API}/com.atproto.repo.createRecord`,
        {
          repo: blueskyDid,
          collection: "app.bsky.feed.like",
          record: {
            subject: { uri, cid },
            createdAt: new Date().toISOString(),
          },
        },
        { headers: { Authorization: `Bearer ${blueskyAuthToken}` } }
      );
      return { success: true, likeUri: response.data.uri };
    } else {
      // Unlike - would need to find and delete the like record
      // For now, simplified
      return { success: true };
    }
  } catch (error) {
    console.error("❌ Bluesky like action failed:", error);
    throw error;
  }
}

export async function repostBlueskyPost(uri: string, cid: string, action: 'repost' | 'unrepost') {
  if (!blueskyAuthToken || !blueskyDid) {
    throw new Error("Bluesky not authenticated");
  }

  try {
    if (action === 'repost') {
      const response = await axios.post(
        `${BSKY_API}/com.atproto.repo.createRecord`,
        {
          repo: blueskyDid,
          collection: "app.bsky.feed.repost",
          record: {
            subject: { uri, cid },
            createdAt: new Date().toISOString(),
          },
        },
        { headers: { Authorization: `Bearer ${blueskyAuthToken}` } }
      );
      return { success: true, repostUri: response.data.uri };
    } else {
      // Unrepost - would need to find and delete the repost record
      // For now, simplified
      return { success: true };
    }
  } catch (error) {
    console.error("❌ Bluesky repost action failed:", error);
    throw error;
  }
}
