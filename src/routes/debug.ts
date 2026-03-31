import { Router } from "express";
import { query } from "../utils/db";

const router = Router();

router.get("/debug/credentials", async (req, res) => {
  try {
    const result = await query("SELECT user_id, platform, handle, token_encrypted FROM credentials");
    res.json({
      success: true,
      credentials: result.rows.map(row => ({
        user_id: row.user_id,
        platform: row.platform,
        handle: row.handle,
        token: row.token_encrypted,
        token_length: row.token_encrypted?.length || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;
