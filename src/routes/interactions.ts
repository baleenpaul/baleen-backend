import { Router } from "express";
import {
  getBlueskyPostThread,
  replyToBlueskyPost,
  followBlueskyUser,
  unfollowBlueskyUser,
  likeBlueskyPost,
  repostBlueskyPost,
} from "../services/blueskyClient";
import {
  getMastodonPostContext,
  replyToMastodonPost,
  followMastodonUser,
  unfollowMastodonUser,
  likeMastodonPost,
  boostMastodonPost,
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

/**
 * POST /interactions/like
 * Like or unlike a post
 *
 * Body:
 * {
 *   "postId": "..." (bluesky: uri),
 *   "platform": "bluesky|mastodon",
 *   "cid": "..." (bluesky only),
 *   "action": "like|unlike"
 * }
 */
router.post("/like", async (req, res) => {
  try {
    const { postId, platform, cid, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing postId, platform, or action",
      });
    }

    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'like' or 'unlike'",
      });
    }

    if (platform === "bluesky") {
      if (!cid) {
        return res.status(400).json({
          success: false,
          error: "Bluesky requires cid",
        });
      }
      const result = await likeBlueskyPost(postId, cid, action);
      return res.json({ success: true, platform, action, result });
    }

    if (platform === "mastodon") {
      const result = await likeMastodonPost(postId, action);
      return res.json({ success: true, platform, action, result });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Like error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Like action failed",
    });
  }
});

/**
 * POST /interactions/repost
 * Repost or unrepost a post
 *
 * Body:
 * {
 *   "postId": "..." (bluesky: uri),
 *   "platform": "bluesky|mastodon",
 *   "cid": "..." (bluesky only),
 *   "action": "repost|unrepost"
 * }
 */
router.post("/repost", async (req, res) => {
  try {
    const { postId, platform, cid, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing postId, platform, or action",
      });
    }

    if (!['repost', 'unrepost', 'boost', 'unboost'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'repost'/'unrepost' (bluesky) or 'boost'/'unboost' (mastodon)",
      });
    }

    if (platform === "bluesky") {
      if (!cid) {
        return res.status(400).json({
          success: false,
          error: "Bluesky requires cid",
        });
      }
      const result = await repostBlueskyPost(postId, cid, action as 'repost' | 'unrepost');
      return res.json({ success: true, platform, action, result });
    }

    if (platform === "mastodon") {
      // Map repost/unrepost to boost/unboost for Mastodon
      const mastodonAction = action === 'repost' ? 'boost' : action === 'unrepost' ? 'unboost' : action;
      const result = await boostMastodonPost(postId, mastodonAction as 'boost' | 'unboost');
      return res.json({ success: true, platform, action: mastodonAction, result });
    }

    return res.status(400).json({
      success: false,
      error: `Platform ${platform} not supported`,
    });
  } catch (error: any) {
    console.error("Repost error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Repost action failed",
    });
  }
});

export default router;
