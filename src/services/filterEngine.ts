import { FeedItem } from "../utils/types";

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
