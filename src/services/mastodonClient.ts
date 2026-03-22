import axios from "axios";

const instanceUrl = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";
const accessToken = process.env.MASTODON_ACCESS_TOKEN;

export async function getMastodonFeed() {
  if (!accessToken) {
    console.warn("❌ Mastodon not authenticated");
    return [];
  }

  try {
    console.log("📡 Fetching Mastodon feed...");
    const response = await axios.get(`${instanceUrl}/api/v1/timelines/home`, {
      params: { limit: 30 },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Mastodon fetched ${response.data?.length || 0} posts`);
    
    // Find posts with media
    const postsWithMedia = response.data.filter((post: any) => post.media_attachments?.length > 0);
    console.log(`📸 Posts with media: ${postsWithMedia.length}/${response.data?.length || 0}`);
    
    if (postsWithMedia[0]) {
      console.log(`📸 First media post has ${postsWithMedia[0].media_attachments.length} attachments`);
      console.log(`📸 Media URLs:`, postsWithMedia[0].media_attachments.map((m: any) => m.url || m.preview_url).join(', '));
    }
    
    return response.data || [];
  } catch (error) {
    console.error("❌ Mastodon feed fetch failed:", error);
    return [];
  }
}

export async function likeMastodonPost(statusId: string, action: 'like' | 'unlike') {
  if (!accessToken) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    if (action === 'like') {
      const response = await axios.post(
        `${instanceUrl}/api/v1/statuses/${statusId}/favourite`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return { success: true, favourited: response.data.favourited };
    } else {
      const response = await axios.post(
        `${instanceUrl}/api/v1/statuses/${statusId}/unfavourite`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return { success: true, favourited: response.data.favourited };
    }
  } catch (error) {
    console.error("❌ Mastodon like action failed:", error);
    throw error;
  }
}

export async function boostMastodonPost(statusId: string, action: 'boost' | 'unboost') {
  if (!accessToken) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    if (action === 'boost') {
      const response = await axios.post(
        `${instanceUrl}/api/v1/statuses/${statusId}/reblog`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return { success: true, reblogged: response.data.reblogged };
    } else {
      const response = await axios.post(
        `${instanceUrl}/api/v1/statuses/${statusId}/unreblog`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return { success: true, reblogged: response.data.reblogged };
    }
  } catch (error) {
    console.error("❌ Mastodon boost action failed:", error);
    throw error;
  }
}

// NEW FUNCTIONS FOR INTERACTIONS

export async function getMastodonPostContext(statusId: string) {
  if (!accessToken) {
    console.warn("Mastodon not authenticated");
    return { post: null, replies: [] };
  }

  try {
    const response = await axios.get(
      `${instanceUrl}/api/v1/statuses/${statusId}/context`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const replies: any[] = [];

    if (response.data.descendants && Array.isArray(response.data.descendants)) {
      response.data.descendants.slice(0, 10).forEach((reply: any) => {
        replies.push({
          id: reply.id,
          author: reply.account?.display_name || reply.account?.username,
          authorHandle: reply.account?.username,
          text: reply.content.replace(/<[^>]*>/g, ""),
          timestamp: reply.created_at,
          likeCount: reply.favourites_count || 0,
        });
      });
    }

    return {
      post: response.data.status || null,
      replies,
    };
  } catch (error) {
    console.error("❌ Failed to fetch post context:", error);
    return { post: null, replies: [] };
  }
}

export async function replyToMastodonPost(statusId: string, replyText: string) {
  if (!accessToken) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    const response = await axios.post(
      `${instanceUrl}/api/v1/statuses`,
      {
        status: replyText,
        in_reply_to_id: statusId,
        visibility: "public",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { success: true, replyId: response.data.id };
  } catch (error) {
    console.error("❌ Failed to reply:", error);
    throw error;
  }
}

export async function followMastodonUser(userId: string) {
  if (!accessToken) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    const response = await axios.post(
      `${instanceUrl}/api/v1/accounts/${userId}/follow`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { success: true, following: response.data.following };
  } catch (error) {
    console.error("❌ Failed to follow user:", error);
    throw error;
  }
}

export async function unfollowMastodonUser(userId: string) {
  if (!accessToken) {
    throw new Error("Mastodon not authenticated");
  }

  try {
    const response = await axios.post(
      `${instanceUrl}/api/v1/accounts/${userId}/unfollow`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { success: true, following: response.data.following };
  } catch (error) {
    console.error("❌ Failed to unfollow user:", error);
    throw error;
  }
}
