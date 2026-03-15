import { FeedItem } from "../utils/types";
import {
  detectAISlopFromComments,
  getSensitivityThreshold,
  shouldWhitelist,
  fetchComments,
  AIFilterSettings,
  FeedItemWithAIScore,
} from "./aiSlopFilter";

// Existing keyword filters
const MUTE_KEYWORDS = ["trump", "bitcoin", "football"];
const HIGHLIGHT_KEYWORDS = ["ireland", "climate", "housing"];

/**
 * Apply basic keyword filters (existing functionality)
 */
export function applyBasicFilters(items: FeedItem[]): FeedItem[] {
  return items
    .map((item) => {
      const text = item.text.toLowerCase();

      // Mute keywords
      for (const word of MUTE_KEYWORDS) {
        if (text.includes(word)) {
          return null;
        }
      }

      // Highlight keywords
      const highlighted = HIGHLIGHT_KEYWORDS.some((word) =>
        text.includes(word)
      );

      return {
        ...item,
        highlighted,
      };
    })
    .filter(Boolean) as FeedItem[];
}

/**
 * Apply AI slop filtering
 * This fetches comments and analyzes them for AI-skeptical sentiment
 */
export async function applyAISlopFilter(
  items: FeedItem[],
  settings: AIFilterSettings
): Promise<FeedItemWithAIScore[]> {
  if (!settings.enabled) {
    // Return items without AI score if filter disabled
    return items.map((item) => ({
      ...item,
      aiScore: undefined,
      aiFiltered: false,
    }));
  }

  const threshold = getSensitivityThreshold(settings.sensitivity);

  // Process items in parallel but with some rate limiting
  const itemsWithScores = await Promise.all(
    items.map(async (item) => {
      // 1. Check whitelist first - if whitelisted, skip analysis
      if (shouldWhitelist(item, settings.whitelist)) {
        return {
          ...item,
          aiScore: 0,
          aiEvidence: [],
          aiConfidence: "low" as const,
          aiFiltered: false,
        };
      }

      // 2. Fetch comments (first 10)
      let comments: string[] = [];
      try {
        comments = await fetchComments(item.id, item.platform);
      } catch (error) {
        // If comment fetching fails, don't filter the post
        console.warn(`Failed to fetch comments for ${item.platform}/${item.id}`);
        return {
          ...item,
          aiScore: 0,
          aiEvidence: [],
          aiConfidence: "low" as const,
          aiFiltered: false,
        };
      }

      // 3. Detect AI slop
      const detection = detectAISlopFromComments(comments);

      // 4. Apply threshold
      const isFiltered = detection.score > threshold;

      return {
        ...item,
        aiScore: detection.score,
        aiEvidence: detection.evidence,
        aiConfidence: detection.confidence,
        aiFiltered: isFiltered,
      };
    })
  );

  // 5. Filter out items marked as AI slop
  return itemsWithScores.filter((item) => !item.aiFiltered);
}

/**
 * Combined filter pipeline
 * 1. Basic keyword filters (mute/highlight)
 * 2. Optional AI slop filter
 */
export async function applyAllFilters(
  items: FeedItem[],
  aiFilterSettings?: AIFilterSettings
): Promise<FeedItemWithAIScore[]> {
  // Apply basic filters first
  let filtered = applyBasicFilters(items);

  // Apply AI slop filter if enabled
  if (aiFilterSettings?.enabled) {
    filtered = await applyAISlopFilter(filtered, aiFilterSettings);
  } else {
    // Return without AI scores if disabled
    filtered = filtered.map((item) => ({
      ...item,
      aiFiltered: false,
    }));
  }

  return filtered as FeedItemWithAIScore[];
}
