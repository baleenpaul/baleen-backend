export interface FeedItem {
  platform: string;
  id: string; // Unique ID for this post (bluesky: uri, mastodon: id)
  text: string;
  author: string;
  authorHandle: string;
  timestamp: string;
  images: string[];
  links: Array<{url: string; title?: string}>;
  quotedPost?: any;
  highlighted?: boolean;
  likeCount: number;
  repostCount: number;
  liked: boolean; // Has current user liked this?
  reposted: boolean; // Has current user reposted this?
}

export interface LikeActionRequest {
  postId: string;
  platform: string;
  action: 'like' | 'unlike';
}

export interface LikeActionResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

export interface RepostActionRequest {
  postId: string;
  platform: string;
  action: 'repost' | 'unrepost';
}

export interface RepostActionResponse {
  success: boolean;
  reposted: boolean;
  repostCount: number;
}
