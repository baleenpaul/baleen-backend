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

// NEW FUNCTIONS FOR INTERACTIONS

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
      replies: replies.slice(0, 10),
    };
  } catch (error) {
    console.error("❌ Failed to fetch post thread:", error);
    return { post: null, replies: [] };
  }
}

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

export async function unfollowBlueskyUser(userDid: string) {
  console.log("Unfollow would delete the follow record for:", userDid);
  return { success: true };
}
