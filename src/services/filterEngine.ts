import { FeedItem } from "../utils/types";

const MUTE_KEYWORDS = ["trump", "bitcoin", "football"];
const HIGHLIGHT_KEYWORDS = ["ireland", "climate", "housing"];

export function applyFilters(items: FeedItem[]): FeedItem[] {
  return items
    .map(item => {
      const text = item.text.toLowerCase();

      for (const word of MUTE_KEYWORDS) {
        if (text.includes(word)) {
          return null;
        }
      }

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