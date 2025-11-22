// routes/ticketMasters.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// GET /api/ticket-categories
router.get("/categories", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, code 
       FROM ticket_categories 
       WHERE is_active = 1 
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching ticket categories", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

// GET /api/ticket-subcategories?category_id=1
router.get("/subcategories", authRequired, async (req, res) => {
  const { category_id } = req.query;
  if (!category_id) {
    return res.status(400).json({ message: "category_id is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT ts.id,
              ts.name,
              ts.code,
              ts.default_owner_user_id,
              ts.default_owner_email,
              u.name AS owner_name
       FROM ticket_subcategories ts
       LEFT JOIN users u ON ts.default_owner_user_id = u.id
       WHERE ts.is_active = 1
         AND ts.category_id = ?
       ORDER BY ts.name`,
      [category_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching ticket subcategories", err);
    res.status(500).json({ message: "Failed to load subcategories" });
  }
});

export default router;
