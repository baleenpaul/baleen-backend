/**
 * AI Filter Logic
 * Applies sensitivity slider (0-100) to AI scores
 * 
 * Strategy: WARNING ONLY - never blocks posts
 * User always has "Lift Filter" option to dismiss warning
 * 
 * Sensitivity 0: All posts shown normally, no filtering
 * Sensitivity 50: Posts with 3+ AI mentions show warning
 * Sensitivity 100: Posts with 1+ AI mention show warning
 */

export interface FilteredPost {
  id: string;
  // ... all other post fields
  aiScore?: number;
  isAI?: boolean;
  aiEvidence?: string[];
  // NEW FILTER FIELDS
  aiWarning?: boolean; // true = show warning banner, user can lift
  aiBlocked?: boolean; // always false - we never block posts
}

/**
 * Apply AI sensitivity filter to enriched feed
 * sensitivity: 0-100
 * 
 * Strategy: WARNING ONLY - never blocks posts
 * User always has "Lift Filter" option
 * 
 * Sensitivity mapping:
 * 0% = disabled (no filtering)
 * 25% = warn if 4+ mentions
 * 50% = warn if 3+ mentions
 * 75% = warn if 2+ mentions
 * 100% = warn if 1+ mention
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

  // Calculate warning threshold based on sensitivity
  // Never block - always allow user to lift filter
  let warnThreshold: number;

  if (sensitivity <= 25) {
    warnThreshold = 4;
  } else if (sensitivity <= 50) {
    warnThreshold = 3;
  } else if (sensitivity <= 75) {
    warnThreshold = 2;
  } else {
    // 76-100: maximum sensitivity
    warnThreshold = 1;
  }

  console.log(`🎚️ AI filter: ON (sensitivity ${sensitivity}) - warn at ${warnThreshold}+`);

  return posts.map((post) => {
    // Posts without AI detection = pass through
    if (!post.aiScore || post.aiScore === 0) {
      return {
        ...post,
        aiWarning: false,
        aiBlocked: false, // ALWAYS false
      };
    }

    // Show warning if threshold met, but NEVER block
    return {
      ...post,
      aiWarning: post.aiScore >= warnThreshold,
      aiBlocked: false, // ALWAYS false - never hide posts
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
 * → posts with aiScore 3+ show warning
 * → user can click "Lift Filter" to dismiss warning
 * 
 * sensitivity = 100
 * → any post with aiScore 1+ shows warning
 * → user can always lift filter to view
 */
