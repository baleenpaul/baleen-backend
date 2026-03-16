import { Router } from "express";
import {
  getBlueskyPostThread,
  replyToBlueskyPost,
  followBlueskyUser,
  unfollowBlueskyUser,
} from "../services/blueskyClient";
import {
  getMastodonPostContext,
  replyToMastodonPost,
  followMastodonUser,
  unfollowMastodonUser,
} from "../services/mastodonClient";

const router = Router();

/**
 * GET /interactions/comments/:platform/:postId
 * Fetch comments for a post
 *
 * Example:
 * GET /interactions/comments/bluesky/at://did:plc:.../app.bsky.feed.post/xyz
 * GET /interactions/comments/mastodon/123456789
 */
router.get("/comments/:platform/:postId", async (req, res) => {
  try {
    const { platform, postId } = req.params;
    const decodedPostId = decodeURIComponent(postId);

    if (platform === "bluesky") {
      const result = await getBlueskyPostThread(decodedPostId);
      return res.json({
        success: true,
        platform: "bluesky",
        postId: decodedPostId,
        replies: result.replies,
      });
    }

    if (platform === "mastodon") {
      const result = await getMastodonPostContext(decodedPostId);
      return res.json({
        success: true,
        platform: "mastodon",
        postId: decodedPostId,
        replies: result.replies,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Comments fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch comments",
    });
  }
});

/**
 * POST /interactions/reply
 * Reply to a post
 *
 * Body:
 * {
 *   "postId": "...",
 *   "platform": "bluesky|mastodon",
 *   "postCid": "..." (bluesky only),
 *   "text": "My reply"
 * }
 */
router.post("/reply", async (req, res) => {
  try {
    const { postId, platform, postCid, text } = req.body;

    if (!postId || !platform || !text) {
      return res.status(400).json({
        success: false,
        error: "Missing postId, platform, or text",
      });
    }

    if (platform === "bluesky") {
      if (!postCid) {
        return res.status(400).json({
          success: false,
          error: "Bluesky requires postCid",
        });
      }
      const result = await replyToBlueskyPost(postId, postCid, text);
      return res.json({ success: true, result });
    }

    if (platform === "mastodon") {
      const result = await replyToMastodonPost(postId, text);
      return res.json({ success: true, result });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Reply error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Reply failed",
    });
  }
});

/**
 * POST /interactions/follow
 * Follow a user
 *
 * Body:
 * {
 *   "userId": "..." (mastodon) or "userDid": "..." (bluesky),
 *   "platform": "bluesky|mastodon"
 * }
 */
router.post("/follow", async (req, res) => {
  try {
    const { userId, userDid, platform } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: "Missing platform",
      });
    }

    if (platform === "bluesky") {
      if (!userDid) {
        return res.status(400).json({
          success: false,
          error: "Bluesky requires userDid",
        });
      }
      const result = await followBlueskyUser(userDid);
      return res.json({ success: true, result });
    }

    if (platform === "mastodon") {
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "Mastodon requires userId",
        });
      }
      const result = await followMastodonUser(userId);
      return res.json({ success: true, result });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Follow error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Follow failed",
    });
  }
});

/**
 * POST /interactions/unfollow
 * Unfollow a user
 *
 * Body:
 * {
 *   "userId": "..." (mastodon) or "userDid": "..." (bluesky),
 *   "platform": "bluesky|mastodon"
 * }
 */
router.post("/unfollow", async (req, res) => {
  try {
    const { userId, userDid, platform } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: "Missing platform",
      });
    }

    if (platform === "bluesky") {
      if (!userDid) {
        return res.status(400).json({
          success: false,
          error: "Bluesky requires userDid",
        });
      }
      const result = await unfollowBlueskyUser(userDid);
      return res.json({ success: true, result });
    }

    if (platform === "mastodon") {
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "Mastodon requires userId",
        });
      }
      const result = await unfollowMastodonUser(userId);
      return res.json({ success: true, result });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Unfollow error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Unfollow failed",
    });
  }
});

export default router;
