import { Router, Request, Response } from "express";
import { getBlueskyFeed } from "../services/blueskyClient";
import { getMastodonFeed } from "../services/mastodonClient";
import { normalizeBskyFeed, normalizeMastodonFeed, mergeFeedsWithDedup } from "../services/feedNormalizer";
import { enrichFeedWithAI } from "../services/feedEnricher";
import { applyAISensitivityFilter } from "../services/aiFilterLogic";
import { verifyToken } from "../utils/jwt";
import { query } from "../utils/db";

const router = Router();

async function extractUserId(authHeader?: string): Promise<number | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    if (decoded && 'userId' in decoded) {
      return decoded.userId;
    }
    return null;
  } catch (error) {
    console.warn('Invalid JWT token:', error);
    return null;
  }
}

async function getUserCredentials(userId: number) {
  try {
    const result = await query(
      'SELECT platform, handle, token_encrypted FROM credentials WHERE user_id = $1',
      [userId]
    );
    
    const credentials: Record<string, { handle: string; token: string }> = {};
    
    for (const row of result.rows) {
      credentials[row.platform] = {
        handle: row.handle,
        token: row.token_encrypted,
      };
      console.log(`✅ Loaded ${row.platform} credentials for user ${userId}`);
    }
    
    return credentials;
  } catch (error) {
    console.error('❌ Failed to fetch user credentials:', error);
    return {};
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const sensitivity = parseInt(req.query.sensitivity as string) || 50;
    console.log(`\n📡 GET /feed (sensitivity: ${sensitivity})`);

    const userId = await extractUserId(req.headers.authorization);
    let userCredentials: Record<string, { handle: string; token: string }> = {};
    
    if (userId) {
      console.log(`👤 User ID: ${userId} - fetching stored credentials...`);
      userCredentials = await getUserCredentials(userId);
    } else {
      console.log(`⚠️  No JWT provided - using unauthenticated mode`);
    }

    console.log(`📡 Fetching Bluesky + Mastodon...`);
    const bskyFeed = await getBlueskyFeed(userCredentials.bluesky);
    const mastodonFeed = await getMastodonFeed(userCredentials.mastodon);

    const normalizedBsky = normalizeBskyFeed(bskyFeed);
    const normalizedMastodon = normalizeMastodonFeed(mastodonFeed);

    let merged = mergeFeedsWithDedup(normalizedBsky, normalizedMastodon, true);
    console.log(`📡 About to sort ${merged.length} posts...`);
    merged.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    console.log(`🤖 Starting AI enrichment...`);
    let enriched = await enrichFeedWithAI(merged);
    console.log(`🤖 AI enrichment complete`);

    console.log(`🎚️ Applying sensitivity filter (${sensitivity})...`);
    let filtered = applyAISensitivityFilter(enriched, sensitivity);

    const aiWarned = filtered.filter((p) => p.aiWarning).length;
    const aiBlocked = filtered.filter((p) => p.aiBlocked).length;

    console.log(`📊 Results: ${filtered.length} posts (${aiWarned} warned, ${aiBlocked} blocked)`);

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
