import axios from "axios";

const config = {
  url: process.env.MASTODON_URL || "https://mastodon.social",
  token: process.env.MASTODON_ACCESS_TOKEN || "",
};

export async function getMastodonFeed() {
  if (!config.token) {
    console.warn("Mastodon token missing");
    return [];
  }

  try {
    const response = await axios.get(`${config.url}/api/v1/timelines/home`, {
      params: { limit: 30 },
      headers: { Authorization: `Bearer ${config.token}` },
    });

    return response.data || [];
  } catch (error) {
    console.error("❌ Mastodon feed fetch failed:", error);
    return [];
  }
}

export async function likeMastodonPost(postId: string, action: 'like' | 'unlike') {
  if (!config.token) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    if (action === 'like') {
      await axios.post(
        `${config.url}/api/v1/statuses/${postId}/favourite`,
        {},
        { headers: { Authorization: `Bearer ${config.token}` } }
      );
      return { success: true };
    } else {
      await axios.post(
        `${config.url}/api/v1/statuses/${postId}/unfavourite`,
        {},
        { headers: { Authorization: `Bearer ${config.token}` } }
      );
      return { success: true };
    }
  } catch (error) {
    console.error("❌ Mastodon like action failed:", error);
    throw error;
  }
}

export async function repostMastodonPost(postId: string, action: 'repost' | 'unrepost') {
  if (!config.token) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    if (action === 'repost') {
      await axios.post(
        `${config.url}/api/v1/statuses/${postId}/reblog`,
        {},
        { headers: { Authorization: `Bearer ${config.token}` } }
      );
      return { success: true };
    } else {
      await axios.post(
        `${config.url}/api/v1/statuses/${postId}/unreblog`,
        {},
        { headers: { Authorization: `Bearer ${config.token}` } }
      );
      return { success: true };
    }
  } catch (error) {
    console.error("❌ Mastodon repost action failed:", error);
    throw error;
  }
}
