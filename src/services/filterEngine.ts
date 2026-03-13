import { FeedItem } from "../utils/types";

/**
 * Keyword filtering + highlighting
 */

// Hard‑coded lists (simple and safe for now)
const MUTE_KEYWORDS = ["trump", "bitcoin", "football"];
const HIGHLIGHT_KEYWORDS = ["ireland", "climate", "housing"];

export function filterFeed(items: FeedItem[]): FeedItem[] {
  return items
    .map(item => {
      const text = item.text.toLowerCase();

      // Muting: Remove posts containing certain keywords
      for (const word of MUTE_KEYWORDS) {
        if (text.includes(word)) {
          return null; // filtered out
        }
      }

      // Highlighting: Mark posts as special
      const highlighted = HIGHLIGHT_KEYWORDS.some(word =>
        text.includes(word)
      );

      return {
        ...item,
        highlighted
      };
    })
    .filter(Boolean) as FeedItem[];
}
