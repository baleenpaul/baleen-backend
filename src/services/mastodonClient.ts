import axios from "axios";

const MASTODON_INSTANCE = "https://mas.to";

export async function initMastodonSession() {
  console.log("⚠️  Mastodon plaintext mode - no session init needed");
}

export async function getMastodonFeed(userCredential?: { handle: string; token: string }) {
  if (!userCredential) {
    console.warn("⚠️  No Mastodon credentials provided");
    return [];
  }

  console.log(`📱 Using Mastodon credentials (${userCredential.handle})`);
  
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v1/timelines/home`, {
      headers: { Authorization: `Bearer ${userCredential.token}` },
      params: { limit: 30 },
    });
    
    console.log(`✅ Mastodon feed fetched: ${response.data?.length || 0} posts`);
    return response.data || [];
  } catch (error) {
    console.error("❌ Mastodon feed fetch failed:", error);
    return [];
  }
}

export async function boostMastodonPost(postId: string, action: 'boost' | 'unboost') {
  throw new Error("Not implemented");
}

export async function favoriteMastodonPost(postId: string, action: 'favorite' | 'unfavorite') {
  throw new Error("Not implemented");
}
