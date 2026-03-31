import axios from "axios";

const MASTODON_INSTANCE = "https://mas.to";
let mastodonAccessToken: string = "";

export async function initMastodonSession() {
  const { MASTODON_ACCESS_TOKEN } = process.env;
  if (!MASTODON_ACCESS_TOKEN) {
    console.warn("⚠️  Mastodon dev credentials not set in environment");
    return;
  }
  mastodonAccessToken = MASTODON_ACCESS_TOKEN;
  console.log("✅ Mastodon dev session initialized");
}

/**
 * Get Mastodon feed using user credentials (if provided) or dev credentials (fallback)
 * @param userCredential - Optional user credentials {handle, token}
 * @returns Array of feed posts
 */
export async function getMastodonFeed(userCredential?: { handle: string; token: string }) {
  let accessToken = mastodonAccessToken;
  
  // Use user credentials if provided
  if (userCredential) {
    console.log(`📱 Using user credentials for Mastodon (${userCredential.handle})`);
    accessToken = userCredential.token;
  }
  
  if (!accessToken) {
    console.warn("⚠️  Mastodon not authenticated (no user or dev credentials)");
    return [];
  }
  
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v1/timelines/home`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
  if (!mastodonAccessToken) {
    throw new Error("Mastodon not authenticated");
  }
  try {
    if (action === 'boost') {
      const response = await axios.post(
        `${MASTODON_INSTANCE}/api/v1/statuses/${postId}/reblog`,
        {},
        { headers: { Authorization: `Bearer ${mastodonAccessToken}` } }
      );
      return { success: true, postId: response.data.id };
    } else {
      const response = await axios.post(
        `${MASTODON_INSTANCE}/api/v1/statuses/${postId}/unreblog`,
        {},
        { headers: { Authorization: `Bearer ${mastodonAccessToken}` } }
      );
      return { success: true, postId: response.data.id };
    }
  } catch (error) {
    console.error("❌ Mastodon boost action failed:", error);
    throw error;
  }
}

export async function favoriteMastodonPost(postId: string, action: 'favorite' | 'unfavorite') {
  if (!mastodonAccessToken) {
    throw new Error("Mastodon not authenticated");
  }
  try {
    if (action === 'favorite') {
      const response = await axios.post(
        `${MASTODON_INSTANCE}/api/v1/statuses/${postId}/favourite`,
        {},
        { headers: { Authorization: `Bearer ${mastodonAccessToken}` } }
      );
      return { success: true, postId: response.data.id };
    } else {
      const response = await axios.post(
        `${MASTODON_INSTANCE}/api/v1/statuses/${postId}/unfavourite`,
        {},
        { headers: { Authorization: `Bearer ${mastodonAccessToken}` } }
      );
      return { success: true, postId: response.data.id };
    }
  } catch (error) {
    console.error("❌ Mastodon favorite action failed:", error);
    throw error;
  }
}
