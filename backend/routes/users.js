import { Router } from "express";
import pool from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/users
 * Returns list of users to assign tickets
 */
router.get("/", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Users list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
