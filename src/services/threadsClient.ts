import fetch from "node-fetch";

const THREADS_API_BASE = "https://graph.threads.net";
const THREADS_OAUTH_URL = "https://threads.net/oauth/authorize";
const THREADS_TOKEN_URL = "https://graph.threads.net/oauth/access_token";

interface ThreadsPost {
  id: string;
  text: string;
  timestamp: string;
  author: string;
  authorId: string;
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
}

class ThreadsClient {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;
  private accessToken?: string;

  constructor(appId: string, appSecret: string, redirectUri: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;
    this.accessToken = process.env.THREADS_ACCESS_TOKEN;
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: "threads_basic_access,threads_content_publish",
      response_type: "code",
      state: state,
    });

    return `${THREADS_OAUTH_URL}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code: code,
      });

      const response = await fetch(THREADS_TOKEN_URL, {
        method: "POST",
        body: params.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { access_token: string };
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (err) {
      console.error("Threads token exchange error:", err);
      throw err;
    }
  }

  // Fetch user's Threads feed
  async getFeed(): Promise<ThreadsPost[]> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await fetch(
        `${THREADS_API_BASE}/me/threads?fields=id,text,timestamp,like_count,replies_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Threads feed: ${response.statusText}`);
      }

      const data = (await response.json()) as { data: any[] };

      return data.data.map((post: any) => ({
        id: post.id,
        text: post.text || "",
        timestamp: post.timestamp,
        author: "Threads User",
        authorId: post.id,
        likeCount: post.like_count || 0,
        repostCount: post.replies_count || 0,
        liked: false,
        reposted: false,
      }));
    } catch (err) {
      console.error("Threads feed fetch error:", err);
      throw err;
    }
  }

  // Like a post
  async likePost(postId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await fetch(
        `${THREADS_API_BASE}/${postId}/likes?access_token=${this.accessToken}`,
        {
          method: "POST",
        }
      );

      return response.ok;
    } catch (err) {
      console.error("Threads like error:", err);
      throw err;
    }
  }

  // Unlike a post
  async unlikePost(postId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await fetch(
        `${THREADS_API_BASE}/${postId}/likes?access_token=${this.accessToken}`,
        {
          method: "DELETE",
        }
      );

      return response.ok;
    } catch (err) {
      console.error("Threads unlike error:", err);
      throw err;
    }
  }

  // Publish a post
  async publishPost(text: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await fetch(
        `${THREADS_API_BASE}/me/threads?access_token=${this.accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to publish post: ${response.statusText}`);
      }

      const data = (await response.json()) as { id: string };
      return data.id;
    } catch (err) {
      console.error("Threads publish error:", err);
      throw err;
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }
}

export default ThreadsClient;