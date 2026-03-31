import axios from "axios";

const BSKY_API = "https://bsky.social/xrpc";
let blueskyAuthToken: string = "";
let blueskyDid: string = "";

export async function initBlueskySession() {
  const { BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD } = process.env;
  if (!BLUESKY_IDENTIFIER || !BLUESKY_APP_PASSWORD) {
    console.warn("⚠️  Bluesky dev credentials not set in environment");
    return;
  }
  try {
    const response = await axios.post(`${BSKY_API}/com.atproto.server.createSession`, {
      identifier: BLUESKY_IDENTIFIER,
      password: BLUESKY_APP_PASSWORD,
    });
    blueskyAuthToken = response.data.accessJwt;
    blueskyDid = response.data.did;
    console.log("✅ Bluesky dev session initialized");
  } catch (error) {
    console.error("❌ Bluesky dev auth failed:", error);
  }
}

/**
 * Get Bluesky feed using user credentials (if provided) or dev credentials (fallback)
 * @param userCredential - Optional user credentials {handle, token}
 * @returns Array of feed posts
 */
export async function getBlueskyFeed(userCredential?: { handle: string; token: string }) {
  let authToken = blueskyAuthToken;
  
  // Use user credentials if provided
  if (userCredential) {
    console.log(`📱 Using user credentials for Bluesky (${userCredential.handle})`);
    try {
      const response = await axios.post(`${BSKY_API}/com.atproto.server.createSession`, {
        identifier: userCredential.handle,
        password: userCredential.token,
      });
      authToken = response.data.accessJwt;
      console.log(`✅ Bluesky user session created`);
    } catch (error) {
      console.error("❌ Bluesky user auth failed:", error);
      console.log("⚠️  Falling back to dev credentials...");
      // Fall through to use dev token
    }
  }
  
  if (!authToken) {
    console.warn("⚠️  Bluesky not authenticated (no user or dev credentials)");
    return [];
  }
  
  try {
    const response = await axios.get(`${BSKY_API}/app.bsky.feed.getTimeline`, {
      params: { limit: 30 },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`✅ Bluesky feed fetched: ${response.data.feed?.length || 0} posts`);
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
      return { success: true };
    }
  } catch (error) {
    console.error("❌ Bluesky repost action failed:", error);
    throw error;
  }
}
