import { Router } from "express";
import pool from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Get all projects
router.get("/", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Projects list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create project
router.post("/", authRequired, async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO projects (name, description, created_by) VALUES (?,?,?)",
      [name, description, created_by]
    );

    res.json({ id: result.insertId, message: "Project created" });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
