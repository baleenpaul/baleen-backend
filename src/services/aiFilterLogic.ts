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

  // Sensitivity > 0 = enable filtering
  console.log(`🎚️ AI filter: ON (sensitivity ${sensitivity})`);

  return posts.map((post) => {
    // Posts without AI detection = pass through
    if (!post.isAI || !post.aiScore) {
      return {
        ...post,
        aiWarning: false,
        aiBlocked: false,
      };
    }

    // Post is flagged as AI (score > 5)
    // Now apply sensitivity logic

    if (sensitivity <= 25) {
      // Low sensitivity: only block posts with very high AI scores (9-10)
      return {
        ...post,
        aiWarning: post.aiScore >= 8, // Warn if score 8+
        aiBlocked: post.aiScore >= 9, // Block if score 9+
      };
    } else if (sensitivity <= 50) {
      // Medium sensitivity: warn on medium AI scores, block on high
      return {
        ...post,
        aiWarning: post.aiScore >= 6, // Warn if score 6+
        aiBlocked: post.aiScore >= 8, // Block if score 8+
      };
    } else if (sensitivity <= 75) {
      // High sensitivity: warn on any AI flag, block on medium-high
      return {
        ...post,
        aiWarning: post.aiScore >= 6, // Warn if score 6+
        aiBlocked: post.aiScore >= 7, // Block if score 7+
      };
    } else {
      // Maximum sensitivity (75-100): block any AI reference
      return {
        ...post,
        aiWarning: false, // Don't even warn, just block
        aiBlocked: post.aiScore > 5, // Block any score > 5 (any AI detected)
      };
    }
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
