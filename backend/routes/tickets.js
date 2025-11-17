// routes/tickets.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

/* ---------- helpers ---------- */

function normalizeStatus(raw) {
  if (!raw) return "todo";
  const s = String(raw).toLowerCase().trim();

  if (s === "todo" || s === "to do" || s === "backlog") return "todo";
  if (
    s === "in-progress" ||
    s === "in progress" ||
    s === "doing" ||
    s.includes("progress")
  )
    return "in-progress";
  if (s === "complete" || s === "completed" || s === "done") return "complete";

  return "todo";
}

/* ---------- GET /api/tickets ----------
 * ADMIN -> all tickets
 * USER  -> only tickets assigned to them
 ---------------------------------------- */
router.get("/", authRequired, async (req, res) => {
  try {
    let sql = `
      SELECT t.*,
             u1.name AS created_by_name,
             u2.name AS assigned_to_name
      FROM tickets t
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

/* ---------- GET /api/tickets/board ----------
 * Board view:
 * ADMIN -> all tickets
 * USER  -> only their tickets
 * Frontend groups by status (todo/in-progress/complete)
 ----------------------------------------------- */
router.get("/board", authRequired, async (req, res) => {
  try {
    let sql = `
      SELECT t.*,
             u1.name AS created_by_name,
             u2.name AS assigned_to_name
      FROM tickets t
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
    console.error("Board error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- POST /api/tickets/create-ticket ----------
 * Create ticket
 * - ADMIN: can create for anyone
 * - USER : can create, but assigned_to forced to themselves
 ----------------------------------------- */
router.post("/create-ticket", authRequired, async (req, res) => {
  try {
    const {
      title,
      description,
      assigned_to,
      due_date, // frontend sends this
      priority = "low",
      status: rawStatus,
    } = req.body;

    // Validate
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const created_by = req.user.id;
    const status = normalizeStatus(rawStatus);

    // If USER, force assign to self
    let assignedToFinal = assigned_to || null;
    if (req.user.role === "USER") {
      assignedToFinal = req.user.id;
    }

    const finalDueDate = due_date || null; // maps to due_date in DB

    const [result] = await pool.query(
      `INSERT INTO tickets
       (title, description, created_by, assigned_to, status, priority, due_date)
       VALUES (?,?,?,?,?,?,?)`,
      [
        title.trim(),
        description || null,
        created_by,
        assignedToFinal,
        status,
        priority,
        finalDueDate,
      ]
    );

    return res.json({
      id: result.insertId,
      message: "Ticket created",
    });
  } catch (err) {
    console.error("Create ticket error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------- PATCH /api/tickets/:id ----------
 * Update title / description / status / etc.
 --------------------------------------------- */
router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    let {
      title,
      description,
      status,
      priority,
      due_date,     // from frontend
      assigned_to,
    } = req.body;

    if (status) {
      status = normalizeStatus(status);
    }
    console.log(status)
console.log(req.body)
    const [result] = await pool.query(
      `UPDATE tickets
       SET
         title       = COALESCE(?, title),
         description = COALESCE(?, description),
         status      = COALESCE(?, status),
         priority    = COALESCE(?, priority),
         due_date    = COALESCE(?, due_date),
         assigned_to = COALESCE(?, assigned_to)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        status ?? null,
        priority ?? null,
        due_date ?? null,     // maps into due_date
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

/* ---------- DELETE /api/tickets/:id ----------
 * Only admin can delete
 ---------------------------------------------- */
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
