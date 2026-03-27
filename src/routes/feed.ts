/**
 * GET /feed
 * Unified feed with AI detection and sensitivity filtering
 * 
 * Query parameters:
 * - sensitivity=0-100 (default: 50)
 *   0 = no AI filtering
 *   50 = medium (warn on score 6+)
 *   100 = strict (block any AI detected)
 */

import { Router } from "express";
import { getBlueskyFeed } from "../services/blueskyClient";
import { getMastodonFeed } from "../services/mastodonClient";
import { normalizeBskyFeed, normalizeMastodonFeed, mergeFeedsWithDedup } from "../services/feedNormalizer";
import { enrichFeedWithAI } from "../services/feedEnricher";
import { applyAISensitivityFilter } from "../services/aiFilterLogic";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sensitivity = parseInt(req.query.sensitivity as string) || 50;
    console.log(`\n📡 GET /feed (sensitivity: ${sensitivity})`);

    // 1. Fetch feeds from platforms
    console.log(`📡 Fetching Bluesky + Mastodon...`);
    const bskyFeed = await getBlueskyFeed();
    const mastodonFeed = await getMastodonFeed();

    // 2. Normalize
    const normalizedBsky = normalizeBskyFeed(bskyFeed);
    const normalizedMastodon = normalizeMastodonFeed(mastodonFeed);

    // 3. Merge
    let merged = mergeFeedsWithDedup(normalizedBsky, normalizedMastodon, true);
    merged.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (isNaN(timeA) || isNaN(timeB)) {
    console.log(`⚠️  Bad timestamp: A=${a.timestamp} (${timeA}), B=${b.timestamp} (${timeB})`);
    }
    return timeB - timeA;
    });

    // 4. Enrich with AI detection
    console.log(`🤖 Starting AI enrichment...`);
    let enriched = await enrichFeedWithAI(merged);
    console.log(`🤖 AI enrichment complete`);

    // 5. Apply sensitivity filter
    console.log(`🎚️ Applying sensitivity filter (${sensitivity})...`);
    let filtered = applyAISensitivityFilter(enriched, sensitivity);

    // 6. Count results
    const aiWarned = filtered.filter((p) => p.aiWarning).length;
    const aiBlocked = filtered.filter((p) => p.aiBlocked).length;
    const aiTotal = aiWarned + aiBlocked;

    console.log(`📊 Results: ${filtered.length} posts (${aiWarned} warned, ${aiBlocked} blocked)`);

    // 7. Return
    res.json({
      success: true,
      count: filtered.length,
      stats: {
        total: merged.length,
        aiDetected: enriched.filter((p) => p.isAI).length,
        aiWarned,
        aiBlocked,
        sensitivity,
      },
      items: filtered,
    });
  } catch (error) {
    console.error("❌ Feed error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch feed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

