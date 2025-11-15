import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

/* ---------- helpers ---------- */

function normalizeStatus(raw) {
  if (!raw) return "todo";
  const s = String(raw).toLowerCase().trim();

  if (s === "todo" || s === "to do") return "todo";
  if (s.includes("progress")) return "progress";
  if (s === "complete" || s === "completed") return "completed";

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
 * Frontend groups by status (todo/progress/completed)
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

/* ---------- POST /api/tickets ----------
 * Create ticket
 * - ADMIN: can create for anyone
 * - USER : can create, by default assign_to themselves (if not provided)
 ----------------------------------------- */
router.post("/", authRequired, async (req, res) => {
  try {
    const {
      title,
      description,
      assigned_to,
      start_date,
      end_date,
      priority = "low",
      status: rawStatus,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const created_by = req.user.id;
    const status = normalizeStatus(rawStatus);

    // If a normal user tries to create for someone else, force to themselves
    let assignedToFinal = assigned_to || null;
    if (req.user.role === "USER") {
      assignedToFinal = req.user.id;
    }

    const [result] = await pool.query(
      `INSERT INTO tickets
       (title, description, created_by, assigned_to, status, priority, start_date, end_date)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        title.trim(),
        description || null,
        created_by,
        assignedToFinal,
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

/* ---------- PATCH /api/tickets/:id ----------
 * Update title / description / status / etc.
 * (Basic rule: allow anyone who is logged in; you can tighten later)
 --------------------------------------------- */
router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    let {
      title,
      description,
      status,
      priority,
      start_date,
      end_date,
      assigned_to,
    } = req.body;

    if (status) {
      status = normalizeStatus(status);
    }

    const [result] = await pool.query(
      `UPDATE tickets
       SET
         title       = COALESCE(?, title),
         description = COALESCE(?, description),
         status      = COALESCE(?, status),
         priority    = COALESCE(?, priority),
         start_date  = COALESCE(?, start_date),
         end_date    = COALESCE(?, end_date),
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
