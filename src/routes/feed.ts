import { Router } from "express";
import { normalizeBskyFeed, normalizeMastodonFeed, mergeFeedsWithDedup } from "../services/feedNormalizer";
import { applyFilters } from "../services/filterEngine";
import { getBlueskyFeed, likeBlueskyPost, repostBlueskyPost } from "../services/blueskyClient";
import { getMastodonFeed, likeMastodonPost, repostMastodonPost } from "../services/mastodonClient";

const router = Router();

// GET unified feed with optional deduplication
router.get("/", async (req, res) => {
  try {
    const deduplicate = req.query.deduplicate === "true";

    const bskyFeed = await getBlueskyFeed();
    const mastodonFeed = await getMastodonFeed();

    const normalizedBsky = normalizeBskyFeed(bskyFeed);
    const normalizedMastodon = normalizeMastodonFeed(mastodonFeed);

    let merged = mergeFeedsWithDedup(normalizedBsky, normalizedMastodon, deduplicate);
    merged = applyFilters(merged);

    res.json(merged);
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// POST like action
router.post("/like", async (req, res) => {
  try {
    const { postId, platform, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({ error: "Missing postId, platform, or action" });
    }

    if (platform === "bluesky") {
      // Bluesky post IDs are URIs, need to extract CID
      // Simplified: would need actual CID from post data
      const result = await likeBlueskyPost(postId, "", action);
      res.json(result);
    } else if (platform === "mastodon") {
      const result = await likeMastodonPost(postId, action);
      res.json(result);
    } else {
      res.status(400).json({ error: `Platform ${platform} not supported` });
    }
  } catch (error: any) {
    console.error("Like action error:", error);
    res.status(500).json({ error: error.message || "Like action failed" });
  }
});

// POST repost action
router.post("/repost", async (req, res) => {
  try {
    const { postId, platform, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({ error: "Missing postId, platform, or action" });
    }

    if (platform === "bluesky") {
      // Simplified: would need actual CID from post data
      const result = await repostBlueskyPost(postId, "", action);
      res.json(result);
    } else if (platform === "mastodon") {
      const result = await repostMastodonPost(postId, action);
      res.json(result);
    } else {
      res.status(400).json({ error: `Platform ${platform} not supported` });
    }
  } catch (error: any) {
    console.error("Repost action error:", error);
    res.status(500).json({ error: error.message || "Repost action failed" });
  }
});

export default router;
