/**
 * AI Filter Logic
 * Applies sensitivity slider (0-100) to AI scores
 * 
 * Sensitivity 0: All posts shown normally, no filtering
 * Sensitivity 50: Suspected AI posts greyed out with warning + score
 * Sensitivity 100: All AI-suspect posts (score > 5) are hidden
 */

export interface FilteredPost {
  id: string;
  // ... all other post fields
  aiScore?: number;
  isAI?: boolean;
  aiEvidence?: string[];
  // NEW FILTER FIELDS
  aiWarning?: boolean; // true = show greyed with warning
  aiBlocked?: boolean; // true = hide completely
}

/**
 * Apply AI sensitivity filter to enriched feed
 * sensitivity: 0-100
 * 
 * Sensitivity mapping:
 * 0% = disabled (no filtering)
 * 25% = warn if 4+ mentions, block if 5+
 * 50% = warn if 3+ mentions, block if 4+
 * 75% = warn if 2+ mentions, block if 3+
 * 100% = warn if 1+ mentions, block if 2+
 */
export function applyAISensitivityFilter(
  posts: any[],
  sensitivity: number
): FilteredPost[] {
  // Sensitivity 0 = disable, show everything normally
  if (sensitivity === 0) {
    console.log(`🎚️ AI filter: OFF (sensitivity 0)`);
    return posts.map((post) => ({
      ...post,
      aiWarning: false,
      aiBlocked: false,
    }));
  }

  // Calculate thresholds based on sensitivity
  let warnThreshold: number;
  let blockThreshold: number;

  if (sensitivity <= 25) {
    warnThreshold = 4;
    blockThreshold = 5;
  } else if (sensitivity <= 50) {
    warnThreshold = 3;
    blockThreshold = 4;
  } else if (sensitivity <= 75) {
    warnThreshold = 2;
    blockThreshold = 3;
  } else {
    // 76-100: maximum sensitivity
    warnThreshold = 1;
    blockThreshold = 2;
  }

  console.log(`🎚️ AI filter: ON (sensitivity ${sensitivity}) - warn at ${warnThreshold}+, block at ${blockThreshold}+`);

  return posts.map((post) => {
    // Posts without AI detection = pass through
    if (!post.aiScore || post.aiScore === 0) {
      return {
        ...post,
        aiWarning: false,
        aiBlocked: false,
      };
    }

    // Apply thresholds
    return {
      ...post,
      aiWarning: post.aiScore >= warnThreshold && post.aiScore < blockThreshold,
      aiBlocked: post.aiScore >= blockThreshold,
    };
  });
}

/**
 * Example:
 * 
 * sensitivity = 0
 * → all posts normal, no filtering
 * 
 * sensitivity = 50
 * → posts with aiScore 6+ get greyed + warning
 * → posts with aiScore 8+ get hidden
 * 
 * sensitivity = 100
 * → any post with aiScore > 5 gets hidden
 */
