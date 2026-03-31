import axios from "axios";

const BSKY_API = "https://bsky.social/xrpc";

export async function initBlueskySession() {
  console.log("⚠️  Bluesky plaintext mode - no session init needed");
}

export async function getBlueskyFeed(userCredential?: { handle: string; token: string }) {
  if (!userCredential) {
    console.warn("⚠️  No Bluesky credentials provided");
    return [];
  }

  console.log(`📱 Using Bluesky credentials (${userCredential.handle})`);
  
  try {
    const response = await axios.post(`${BSKY_API}/com.atproto.server.createSession`, {
      identifier: userCredential.handle,
      password: userCredential.token,
    });
    
    const authToken = response.data.accessJwt;
    console.log(`✅ Bluesky session created`);

    const feedResponse = await axios.get(`${BSKY_API}/app.bsky.feed.getTimeline`, {
      params: { limit: 30 },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    console.log(`✅ Bluesky feed fetched: ${feedResponse.data.feed?.length || 0} posts`);
    return feedResponse.data.feed || [];
  } catch (error) {
    console.error("❌ Bluesky feed fetch failed:", error);
    return [];
  }
}

export async function likeBlueskyPost(uri: string, cid: string, action: 'like' | 'unlike') {
  throw new Error("Not implemented - use user credentials from /feed endpoint");
}

export async function repostBlueskyPost(uri: string, cid: string, action: 'repost' | 'unrepost') {
  throw new Error("Not implemented - use user credentials from /feed endpoint");
}
