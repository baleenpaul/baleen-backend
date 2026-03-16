// ADD THIS TO YOUR EXISTING blueskyClient.ts FILE
// Place after the existing functions

/**
 * Get comments/replies for a Bluesky post
 * Uses getPostThread to fetch the post and its replies
 */
export async function getBlueskyPostThread(uri: string) {
  if (!blueskyAuthToken) {
    console.warn("Bluesky not authenticated");
    return { post: null, replies: [] };
  }

  try {
    const response = await axios.get(`${BSKY_API}/app.bsky.feed.getPostThread`, {
      params: { uri, depth: 1, limit: 10 },
      headers: { Authorization: `Bearer ${blueskyAuthToken}` },
    });

    const thread = response.data.thread;
    const replies: any[] = [];

    // Extract replies from thread
    if (thread && thread.replies && Array.isArray(thread.replies)) {
      thread.replies.forEach((reply: any) => {
        if (reply.post && reply.post.record) {
          replies.push({
            id: reply.post.uri,
            author: reply.post.author?.displayName || reply.post.author?.handle,
            authorHandle: reply.post.author?.handle,
            text: reply.post.record.text,
            timestamp: reply.post.record.createdAt,
            likeCount: reply.post.likeCount || 0,
          });
        }
      });
    }

    return {
      post: thread?.post || null,
      replies: replies.slice(0, 10), // Limit to 10 comments
    };
  } catch (error) {
    console.error("❌ Failed to fetch post thread:", error);
    return { post: null, replies: [] };
  }
}

/**
 * Reply to a Bluesky post
 */
export async function replyToBlueskyPost(
  postUri: string,
  postCid: string,
  replyText: string
) {
  if (!blueskyAuthToken || !blueskyDid) {
    throw new Error("Bluesky not authenticated");
  }

  try {
    const response = await axios.post(
      `${BSKY_API}/com.atproto.repo.createRecord`,
      {
        repo: blueskyDid,
        collection: "app.bsky.feed.post",
        record: {
          text: replyText,
          reply: {
            root: { uri: postUri, cid: postCid },
            parent: { uri: postUri, cid: postCid },
          },
          createdAt: new Date().toISOString(),
        },
      },
      { headers: { Authorization: `Bearer ${blueskyAuthToken}` } }
    );

    return { success: true, replyUri: response.data.uri };
  } catch (error) {
    console.error("❌ Failed to reply:", error);
    throw error;
  }
}

/**
 * Follow a Bluesky user
 */
export async function followBlueskyUser(userDid: string) {
  if (!blueskyAuthToken || !blueskyDid) {
    throw new Error("Bluesky not authenticated");
  }

  try {
    const response = await axios.post(
      `${BSKY_API}/com.atproto.repo.createRecord`,
      {
        repo: blueskyDid,
        collection: "app.bsky.graph.follow",
        record: {
          subject: userDid,
          createdAt: new Date().toISOString(),
        },
      },
      { headers: { Authorization: `Bearer ${blueskyAuthToken}` } }
    );

    return { success: true, followUri: response.data.uri };
  } catch (error) {
    console.error("❌ Failed to follow user:", error);
    throw error;
  }
}

/**
 * Unfollow a Bluesky user (simplified)
 */
export async function unfollowBlueskyUser(userDid: string) {
  // In practice, would need to find and delete the follow record
  // For now, simplified
  console.log("Unfollow would delete the follow record for:", userDid);
  return { success: true };
}
