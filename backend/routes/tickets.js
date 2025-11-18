// routes/tickets.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

/* ---------- GET /api/tickets ---------- */
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

/* ---------- GET /api/tickets/board ---------- */
// router.get("/board", authRequired, async (req, res) => {
//   try {
//     let sql = `
//       SELECT t.*,
//              u1.name AS created_by_name,
//              u2.name AS assigned_to_name
//       FROM tickets t
//       LEFT JOIN users u1 ON t.created_by = u1.id
//       LEFT JOIN users u2 ON t.assigned_to = u2.id
//     `;
//     const params = [];

//     if (req.user.role === "USER") {
//       sql += " WHERE t.assigned_to = ?";
//       params.push(req.user.id);
//     }

//     sql += " ORDER BY t.created_at DESC";

//     const [rows] = await pool.query(sql, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("Board error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
/* ---------- GET /api/tickets/board ---------- */
router.get("/board", authRequired, async (req, res) => {
  try {
    let sql = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.assigned_to,
        t.created_by,
        u1.name AS created_by_name,
        u2.name AS assigned_to_name,
JSON_ARRAYAGG(
  JSON_OBJECT(
    'id', ta.id,
    'file_name', ta.file_name,
    'mime_type', ta.mime_type,
    'size', ta.size
  )
) AS attachments

      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      LEFT JOIN ticket_attachments ta ON ta.ticket_id = t.id
    `;

    const params = [];

    // USER role filter
    if (req.user.role === "USER") {
      sql += " WHERE t.assigned_to = ?";
      params.push(req.user.id);
    }

    sql += `
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const [rows] = await pool.query(sql, params);

    // Fix: MySQL returns [null] if no attachments → convert to []
const cleanRows = rows.map((t) => {
  let files = [];

  if (t.attachments) {
    try {
      files = JSON.parse(t.attachments);
      if (!Array.isArray(files)) files = [];
    } catch {
      files = [];
    }
  }

  return {
    ...t,
    attachments: files.filter((x) => x !== null),
  };
});


    res.json(cleanRows);
  } catch (err) {
    console.error("Board error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/* ---------- POST /api/tickets/create-ticket ---------- */
router.post(
  "/create-ticket",
  authRequired,
  upload.array("attachments"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        assigned_to,
        due_date,
        priority = "low",
        status,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const created_by = req.user.id;

      let assignedToFinal = assigned_to || null;
      if (req.user.role === "USER") {
        assignedToFinal = req.user.id;
      }

      const finalDueDate = due_date || null;

      // STEP 1 — Insert ticket
      const [result] = await pool.query(
        `INSERT INTO tickets
        (title, description, created_by, assigned_to, status, priority, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description || null,
          created_by,
          assignedToFinal,
          status || "todo",
          priority,
          finalDueDate,
        ]
      );

      const ticketId = result.insertId;

      // STEP 2 — Insert uploaded files as BLOBs
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await pool.query(
            `INSERT INTO ticket_attachments
            (ticket_id, file_name, mime_type, size, file_data)
            VALUES (?, ?, ?, ?, ?)`,
            [
              ticketId,
              file.originalname,
              file.mimetype,
              file.size,
              file.buffer, // <-- file stored as BLOB
            ]
          );
        }
      }

      res.json({
        id: ticketId,
        message: "Ticket created successfully with attachments",
      });
    } catch (err) {
      console.error("Create ticket error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* ---------- PATCH /api/tickets/:id ---------- */
router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    let {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
    } = req.body;
console.log(req.body)
    // NO NORMALIZE — store exactly what frontend sends

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
        due_date ?? null,
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


// ================================
// DOWNLOAD ATTACHMENT BY ID
// ================================
router.get("/attachment/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query(
      `SELECT file_name, mime_type, file_data 
       FROM ticket_attachments WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = rows[0];

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.file_name}"`
    );

    return res.send(file.file_data);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- DELETE /api/tickets/:id ---------- */
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
