import { Router } from "express";
import {
  normalizeBskyFeed,
  normalizeMastodonFeed,
  mergeFeedsWithDedup,
} from "../services/feedNormalizer";
import { applyAllFilters } from "../services/filterEngine";
import {
  AIFilterSettings,
  WhitelistRule,
} from "../services/aiSlopFilter";
import { getBlueskyFeed, likeBlueskyPost, repostBlueskyPost } from "../services/blueskyClient";
import { getMastodonFeed, likeMastodonPost, boostMastodonPost } from "../services/mastodonClient";

const router = Router();

/**
 * Parse whitelist rules from query string
 * Format: "author:@paulknally,hashtag:#ai_research,author:@trusted"
 */
function parseWhitelistRules(whitelistStr?: string): WhitelistRule[] {
  if (!whitelistStr) return [];

  return whitelistStr.split(",").map((rule) => {
    const [type, value] = rule.split(":");
    return {
      type: (type as "author" | "hashtag") || "author",
      value: value || "",
      reason: "User whitelist",
    };
  });
}

/**
 * GET /feed
 * Fetch unified feed with optional filtering
 *
 * Query parameters:
 * - deduplicate=true/false (default: true)
 * - filterAI=true/false (default: false)
 * - sensitivity=0-100 (default: 50, only if filterAI=true)
 * - whitelist=author:@paulknally,hashtag:#research (comma-separated rules)
 *
 * Example:
 * GET /feed?deduplicate=true&filterAI=true&sensitivity=40&whitelist=author:@paulknally,hashtag:#science
 */
router.get("/", async (req, res) => {
  try {
    const deduplicate = req.query.deduplicate !== "false";
    const filterAI = req.query.filterAI === "true";
    const sensitivity = parseInt(req.query.sensitivity as string) || 50;
    const whitelist = parseWhitelistRules(req.query.whitelist as string);

    // Fetch feeds from platforms
    const bskyFeed = await getBlueskyFeed();
    const mastodonFeed = await getMastodonFeed();

    // Normalize
    const normalizedBsky = normalizeBskyFeed(bskyFeed);
    const normalizedMastodon = normalizeMastodonFeed(mastodonFeed);

    // Merge with optional deduplication
    let merged = mergeFeedsWithDedup(
      normalizedBsky,
      normalizedMastodon,
      deduplicate
    );

    // Apply filters (basic + AI)
    const aiSettings: AIFilterSettings = {
      enabled: filterAI,
      sensitivity: Math.max(0, Math.min(100, sensitivity)), // Clamp 0-100
      whitelist,
    };

    const filtered = await applyAllFilters(merged, aiSettings);

    res.json({
      success: true,
      count: filtered.length,
      filters: {
        deduplicate,
        aiFilter: {
          enabled: filterAI,
          sensitivity,
          whitelistRules: whitelist.length,
        },
      },
      items: filtered,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch feed",
      message: (error as Error).message,
    });
  }
});

/**
 * POST /feed/like
 * Like a post
 *
 * Body:
 * {
 *   "postId": "...",
 *   "platform": "bluesky|mastodon",
 *   "action": "like|unlike"
 * }
 */
router.post("/like", async (req, res) => {
  try {
    const { postId, platform, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing postId, platform, or action",
      });
    }

    if (platform === "bluesky") {
      const result = await likeBlueskyPost(postId, "", action);
      res.json({ success: true, result });
    } else if (platform === "mastodon") {
      const result = await likeMastodonPost(postId, action);
      res.json({ success: true, result });
    } else {
      res.status(400).json({
        success: false,
        error: `Platform ${platform} not supported`,
      });
    }
  } catch (error: any) {
    console.error("Like action error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Like action failed",
    });
  }
});

/**
 * POST /feed/repost
 * Repost/boost a post
 *
 * Body:
 * {
 *   "postId": "...",
 *   "platform": "bluesky|mastodon",
 *   "action": "repost|unrepost"
 * }
 */
router.post("/repost", async (req, res) => {
  try {
    const { postId, platform, action } = req.body;

    if (!postId || !platform || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing postId, platform, or action",
      });
    }

    if (platform === "bluesky") {
      const result = await repostBlueskyPost(postId, "", action);
      res.json({ success: true, result });
    } else if (platform === "mastodon") {
      const result = await boostMastodonPost(postId, action);
      res.json({ success: true, result });
    } else {
      res.status(400).json({
        success: false,
        error: `Platform ${platform} not supported`,
      });
    }
  } catch (error: any) {
    console.error("Repost action error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Repost action failed",
    });
  }
});

/**
 * GET /feed/filters
 * Get available filter options and keywords
 */
router.get("/filters", async (req, res) => {
  res.json({
    success: true,
    filters: {
      basicKeywords: {
        mute: ["trump", "bitcoin", "football"],
        highlight: ["ireland", "climate", "housing"],
      },
      aiSlop: {
        keywords: [
          "ai generated",
          "ai slop",
          "gpt",
          "chatgpt",
          "claude",
          "artificial intelligence",
          "llm",
          "bot",
          "fake",
        ],
        sensitivity: {
          min: 0,
          max: 100,
          default: 50,
          labels: {
            0: "Strict (filter more)",
            50: "Medium",
            100: "Lenient (filter less)",
          },
        },
        whitelistTypes: ["author", "hashtag"],
      },
    },
  });
});

export default router;
