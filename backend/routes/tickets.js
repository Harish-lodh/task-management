import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// Get all tickets (ADMIN) or own assigned (USER)
router.get("/", authRequired, async (req, res) => {
  try {
    let sql = `
      SELECT t.*, 
             p.name AS project_name,
             u1.name AS created_by_name,
             u2.name AS assigned_to_name
      FROM tickets t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
    `;
    const params = [];

    if (req.user.role === "USER") {
      sql += " WHERE t.assigned_to = ?";
      params.push(req.user.id);
    }

    sql += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Tickets list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Board view: tickets for one project grouped by status (frontend groups)
router.get("/board/:projectId", authRequired, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE project_id = ? ORDER BY created_at DESC",
      [projectId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Board error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create ticket (ADMIN; or allow USER also if you want)
router.post("/", authRequired, async (req, res) => {
  try {
    const {
      title,
      description,
      project_id,
      assigned_to,
      status = "Backlog",
      priority = "Low",
      start_date,
      end_date,
    } = req.body;

    const created_by = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO tickets 
       (title, description, project_id, created_by, assigned_to, status, priority, start_date, end_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        title,
        description,
        project_id || null,
        created_by,
        assigned_to || null,
        status,
        priority,
        start_date || null,
        end_date || null,
      ]
    );

    res.json({ id: result.insertId, message: "Ticket created" });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update ticket (title/description/status etc.)
router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      description,
      status,
      priority,
      start_date,
      end_date,
      assigned_to,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE tickets 
       SET 
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         status = COALESCE(?, status),
         priority = COALESCE(?, priority),
         start_date = COALESCE(?, start_date),
         end_date = COALESCE(?, end_date),
         assigned_to = COALESCE(?, assigned_to)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        status ?? null,
        priority ?? null,
        start_date ?? null,
        end_date ?? null,
        assigned_to ?? null,
        id,
      ]
    );

    res.json({ message: "Ticket updated", changedRows: result.affectedRows });
  } catch (err) {
    console.error("Update ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete ticket (ADMIN only)
router.delete("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM tickets WHERE id = ?", [id]);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    console.error("Delete ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
