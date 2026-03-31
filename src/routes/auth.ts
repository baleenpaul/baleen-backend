import { Router, Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken, verifyToken } from "../utils/jwt";
import { query } from "../utils/db";

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const passwordHash = hashPassword(password);
    const result = await query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id, username: user.username, email: user.email });

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Missing credentials" });
    }

    const result = await query(
      "SELECT id, username, email, password_hash FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken({ userId: user.id, username: user.username, email: user.email });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

// Add credential (plaintext token storage)
router.post("/add-credential", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !('userId' in decoded)) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const { platform, handle, token: platformToken } = req.body;
    if (!platform || !handle || !platformToken) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Store plaintext token (no encryption)
    await query(
      "INSERT INTO credentials (user_id, platform, handle, token_encrypted) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, platform) DO UPDATE SET handle = $3, token_encrypted = $4",
      [decoded.userId, platform, handle, platformToken]
    );

    console.log(`✅ Stored ${platform} credentials for user ${decoded.userId}`);

    res.json({
      success: true,
      message: `${platform} credentials saved`,
    });
  } catch (error) {
    console.error("Add credential error:", error);
    res.status(500).json({ success: false, error: "Failed to save credentials" });
  }
});

// Get credentials
router.get("/credentials", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !('userId' in decoded)) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const result = await query(
      "SELECT platform, handle FROM credentials WHERE user_id = $1",
      [decoded.userId]
    );

    res.json({
      success: true,
      credentials: result.rows,
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch credentials" });
  }
});

export default router;
