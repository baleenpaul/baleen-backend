import { Router } from "express";
import {
  likeBlueskyPost,
  repostBlueskyPost,
} from "../services/blueskyClient";
import {
  boostMastodonPost,
  favoriteMastodonPost,
} from "../services/mastodonClient";

const router = Router();

/**
 * POST /interactions/like
 * Like a post on Bluesky or Mastodon
 * 
 * Body: { postId, platform, action, cid }
 */
router.post("/like", async (req, res) => {
  try {
    const { postId, platform, action, cid } = req.body;
    
    if (platform === "bluesky") {
      const result = await likeBlueskyPost(postId, cid, action);
      res.json(result);
    } else if (platform === "mastodon") {
      const result = await favoriteMastodonPost(postId, action);
      res.json(result);
    } else {
      res.status(400).json({ success: false, error: "Unknown platform" });
    }
  } catch (error) {
    console.error("❌ Like action failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

/**
 * POST /interactions/repost
 * Repost a post on Bluesky or Mastodon (boost on Mastodon)
 * 
 * Body: { postId, platform, action, cid }
 */
router.post("/repost", async (req, res) => {
  try {
    const { postId, platform, action, cid } = req.body;
    
    if (platform === "bluesky") {
      const result = await repostBlueskyPost(postId, cid, action);
      res.json(result);
    } else if (platform === "mastodon") {
      const result = await boostMastodonPost(postId, action);
      res.json(result);
    } else {
      res.status(400).json({ success: false, error: "Unknown platform" });
    }
  } catch (error) {
    console.error("❌ Repost action failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;
