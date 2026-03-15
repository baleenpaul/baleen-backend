import express, { Request, Response } from "express";
import ThreadsClient from "../services/threadsClient";

const router = express.Router();

const threadsClient = new ThreadsClient(
  process.env.THREADS_APP_ID || "",
  process.env.THREADS_APP_SECRET || "",
  "https://baleen-backend.onrender.com/auth/threads/callback"
);

// Generate state for CSRF protection
function generateState(): string {
  return Math.random().toString(36).substring(7);
}

// Step 1: Redirect to Threads OAuth
router.get("/threads/login", (req: Request, res: Response) => {
  const state = generateState();
  res.cookie("oauth_state", state, { httpOnly: true, maxAge: 600000 });

  const authUrl = threadsClient.getAuthorizationUrl(state);
  console.log(`🔗 Redirecting to Threads OAuth: ${authUrl}`);
  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
router.get("/threads/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;
    const savedState = req.cookies.oauth_state;

    // Check for Threads error response
    if (error) {
      console.error(`❌ Threads OAuth error: ${error} - ${error_description}`);
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://baleen-frontend.netlify.app"}?threads=error&message=${encodeURIComponent(error_description as string)}`
      );
    }

    // Verify state for CSRF protection
    if (state !== savedState) {
      console.error("❌ State mismatch - possible CSRF attack");
      return res.status(400).json({ error: "State mismatch" });
    }

    if (!code) {
      console.error("❌ No authorization code received");
      return res.status(400).json({ error: "No authorization code" });
    }

    // Exchange code for access token
    const accessToken = await threadsClient.exchangeCodeForToken(code as string);

    // Store token in cookie for subsequent requests
    res.cookie("threads_access_token", accessToken, { 
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    // Also set it in the client for future API calls
    threadsClient.setAccessToken(accessToken);
    
    console.log("✅ Threads OAuth successful, access token acquired");

    // Redirect to frontend with success
    res.redirect(
      `${process.env.FRONTEND_URL || "https://baleen-frontend.netlify.app"}?threads=connected`
    );
  } catch (err) {
    console.error("❌ Threads OAuth callback error:", err);
    res.redirect(
      `${process.env.FRONTEND_URL || "https://baleen-frontend.netlify.app"}?threads=error&message=${encodeURIComponent((err as Error).message)}`
    );
  }
});

// Logout - clear Threads token
router.post("/threads/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("threads_access_token");
    console.log("✅ Threads token cleared");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Handle uninstall callback
router.post("/threads/uninstall", (req: Request, res: Response) => {
  try {
    // Handle deauthorization
    console.log("Threads app uninstalled");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Uninstall error:", err);
    res.status(500).json({ error: "Uninstall failed" });
  }
});

// Handle delete callback
router.post("/threads/delete", (req: Request, res: Response) => {
  try {
    // Handle data deletion request
    console.log("Threads user data deletion requested");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;