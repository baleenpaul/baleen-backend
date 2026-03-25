/**
 * Feed Enrichment Service
 * Adds AI detection scores to each post
 */

import { getBlueskyReplies, getMastodonReplies } from "./replyFetcher";
import { detectAIInReplies, AIScore } from "./aiDetector";

export interface FeedItemWithAIScore {
  id: string;
  platform: "bluesky" | "mastodon";
  author: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  liked?: boolean;
  reposted?: boolean;
  images: string[];
  links: string[];
  // NEW AI FIELDS
  aiScore?: number; // 1-10
  isAI?: boolean; // true if score > 5
  aiEvidence?: string[]; // Keywords found
}

/**
 * Enrich a single post with AI detection
 */
export async function enrichPostWithAI(post: any): Promise<FeedItemWithAIScore> {
  let replies: string[] = [];

  try {
    // Fetch replies based on platform
    if (post.platform === "bluesky") {
      replies = await getBlueskyReplies(post.id);
    } else if (post.platform === "mastodon") {
      replies = await getMastodonReplies(post.id);
    }

    // Detect AI
    const aiScore = detectAIInReplies(replies);

    return {
      ...post,
      aiScore: aiScore.score,
      isAI: aiScore.isAI,
      aiEvidence: aiScore.evidence,
    };
  } catch (error) {
    console.error(`❌ Error enriching post ${post.id}:`, error);
    return {
      ...post,
      aiScore: 5, // Neutral score if enrichment fails
      isAI: false,
      aiEvidence: [],
    };
  }
}

/**
 * Enrich entire feed with AI scores
 */
export async function enrichFeedWithAI(feed: any[]): Promise<FeedItemWithAIScore[]> {
  console.log(`🤖 Enriching ${feed.length} posts with AI detection...`);
  
  // Process all posts in parallel (but be respectful of rate limits)
  const enrichedPosts = await Promise.all(
    feed.map((post) => enrichPostWithAI(post))
  );

  // Log summary
  const aiPosts = enrichedPosts.filter((p) => p.isAI).length;
  console.log(`🤖 AI Detection complete: ${aiPosts}/${enrichedPosts.length} posts flagged as probable AI`);

  return enrichedPosts;
}
