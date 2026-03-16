// ADD THIS TO YOUR EXISTING mastodonClient.ts FILE
// Place after the existing functions

/**
 * Get comments/replies for a Mastodon post
 * Uses /statuses/{id}/context endpoint
 */
export async function getMastodonPostContext(statusId: string) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instanceUrl = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";

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

    // Extract descendant replies
    if (response.data.descendants && Array.isArray(response.data.descendants)) {
      response.data.descendants.slice(0, 10).forEach((reply: any) => {
        replies.push({
          id: reply.id,
          author: reply.account?.display_name || reply.account?.username,
          authorHandle: reply.account?.username,
          text: reply.content.replace(/<[^>]*>/g, ""), // Strip HTML
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

/**
 * Reply to a Mastodon post
 */
export async function replyToMastodonPost(statusId: string, replyText: string) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instanceUrl = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";

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

/**
 * Follow a Mastodon user
 */
export async function followMastodonUser(userId: string) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instanceUrl = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";

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

/**
 * Unfollow a Mastodon user
 */
export async function unfollowMastodonUser(userId: string) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instanceUrl = process.env.MASTODON_INSTANCE_URL || "https://mastodon.social";

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
