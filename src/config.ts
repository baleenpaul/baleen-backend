export const config = {
  bluesky: {
    identifier: process.env.BLUESKY_IDENTIFIER || "",
    appPassword: process.env.BLUESKY_APP_PASSWORD || ""
  },
  mastodon: {
    url: process.env.MASTODON_URL || "",
    accessToken: process.env.MASTODON_ACCESS_TOKEN || ""
  }
};
