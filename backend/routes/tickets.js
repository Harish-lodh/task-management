// routes/tickets.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import multer from "multer";
import nodemailer from "nodemailer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

/* ======================
      EMAIL CONFIG
   ====================== */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendTicketEmail({ to, cc, ticket, categoryName, subcategoryName, ownerName }) {
  if (!to) return;

  const subject = `[Ticket #${ticket.id}] ${ticket.title}`;
  const text = `
Hi ${ownerName || "Team"},

A new ticket has been created.

Category    : ${categoryName || "-"}
Subcategory : ${subcategoryName || "-"}
Title       : ${ticket.title}
Description : ${ticket.description || "-"}
Priority    : ${ticket.priority || "-"}
Status      : ${ticket.status || "-"}
Due Date    : ${ticket.due_date || "-"}

Please login to the Ticket Dashboard to take action.

Thanks,
Ticket System
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@yourdomain.com",
    to,
    cc: cc || undefined,
    subject,
    text,
  });
}

/* ======================
      LIST TICKETS
   ====================== */

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
//       SELECT 
//         t.id,
//         t.title,
//         t.description,
//         t.status,
//         t.priority,
//         t.due_date,
//         t.assigned_to,
//         t.created_by,
//         t.category_id,
//         t.subcategory_id,
//         tc.name AS category_name,
//         ts.name AS subcategory_name,
//         u1.name AS created_by_name,
//         u2.name AS assigned_to_name,
//         JSON_ARRAYAGG(
//           JSON_OBJECT(
//             'id', ta.id,
//             'file_name', ta.file_name,
//             'mime_type', ta.mime_type,
//             'size', ta.size
//           )
//         ) AS attachments
//       FROM tickets t
//       LEFT JOIN users u1 ON t.created_by = u1.id
//       LEFT JOIN users u2 ON t.assigned_to = u2.id
//       LEFT JOIN ticket_attachments ta ON ta.ticket_id = t.id
//       LEFT JOIN ticket_categories tc ON tc.id = t.category_id
//       LEFT JOIN ticket_subcategories ts ON ts.id = t.subcategory_id
//     `;

//     const params = [];

//     if (req.user.role === "USER") {
//       sql += " WHERE t.assigned_to = ?";
//       params.push(req.user.id);
//     }

//     sql += `
//       GROUP BY t.id
//       ORDER BY t.created_at DESC
//     `;

//     const [rows] = await pool.query(sql, params);

//     const cleanRows = rows.map((t) => {
//       let files = [];

//       if (t.attachments) {
//         try {
//           files = JSON.parse(t.attachments);
//           if (!Array.isArray(files)) files = [];
//         } catch {
//           files = [];
//         }
//       }

//       return {
//         ...t,
//         attachments: files.filter((x) => x !== null),
//       };
//     });

//     res.json(cleanRows);
//   } catch (err) {
//     console.error("Board error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// GET /tickets/board
router.get("/board", authRequired, async (req, res) => {
  try {
    const { assigneeId } = req.query; // NEW

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
        t.category_id,
        t.subcategory_id,
        tc.name AS category_name,
        ts.name AS subcategory_name,
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
      LEFT JOIN ticket_categories tc ON tc.id = t.category_id
      LEFT JOIN ticket_subcategories ts ON ts.id = t.subcategory_id
    `;

    const params = [];
    const where = [];

    // If normal USER => always see own tickets only (keep old behavior)
    if (req.user.role === "USER") {
      where.push("t.assigned_to = ?");
      params.push(req.user.id);
    } else if (assigneeId) {
      // For ADMIN / MANAGER allow filter by assignee
      where.push("t.assigned_to = ?");
      params.push(assigneeId);
    }

    if (where.length) {
      sql += " WHERE " + where.join(" AND ");
    }

    sql += `
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const [rows] = await pool.query(sql, params);

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

/* ======================
      CREATE TICKET
   ====================== */

/* ---------- POST /api/tickets/create-ticket ---------- */
router.post(
  "/create-ticket",
  authRequired,
  upload.array("attachments"),
  async (req, res) => {
    const conn = await pool.getConnection();

    try {
      const {
        title,
        description,
        assigned_to,
        due_date,
        priority = "low",
        status,

        // NEW FIELDS from frontend FormData
        category_id,
        subcategory_id,
      } = req.body;
      console.log(req.body)

      if (!title || !title.trim()) {
        conn.release();
        return res.status(400).json({ message: "Title is required" });
      }

      const created_by = req.user.id;

      let assignedToFinal = assigned_to || null;
      let ownerEmail = null;
      let ownerName = null;
      let categoryName = null;
      let subcategoryName = null;

      await conn.beginTransaction();

      // If no explicit assignee, try from subcategory mapping
      if (!assignedToFinal && subcategory_id) {
        const [rows] = await conn.query(
          `SELECT 
             ts.default_owner_user_id,
             ts.default_owner_email,
             ts.name AS subcategory_name,
             tc.name AS category_name,
             u.email AS user_email,
             u.name AS user_name
           FROM ticket_subcategories ts
           JOIN ticket_categories tc ON tc.id = ts.category_id
           LEFT JOIN users u ON ts.default_owner_user_id = u.id
           WHERE ts.id = ?`,
          [subcategory_id]
        );

        if (rows.length > 0) {
          const r = rows[0];
          categoryName = r.category_name;
          subcategoryName = r.subcategory_name;

          if (r.default_owner_user_id) {
            assignedToFinal = r.default_owner_user_id;
          }

          ownerEmail = r.user_email || r.default_owner_email;
          ownerName = r.user_name;
        }
      }

      // If still no email/owner info but we DO have assigned_toFinal,
      // fetch that user so we can email them
      if (assignedToFinal && !ownerEmail) {
        const [urows] = await conn.query(
          `SELECT email, name FROM users WHERE id = ?`,
          [assignedToFinal]
        );
        if (urows.length > 0) {
          ownerEmail = urows[0].email;
          ownerName = urows[0].name;
        }
      }

      // If role is USER, they cannot assign to others → assign to self
      if (req.user.role === "USER") {
        assignedToFinal = req.user.id;
      }

      const finalDueDate = due_date || null;

      // STEP 1 — Insert ticket
      const [result] = await conn.query(
        `INSERT INTO tickets
          (title, description, created_by, assigned_to, status, priority, due_date,
           category_id, subcategory_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description || null,
          created_by,
          assignedToFinal,
          status || "todo",
          priority,
          finalDueDate,
          category_id || null,
          subcategory_id || null,
        ]
      );

      const ticketId = result.insertId;

      // STEP 2 — Insert uploaded files as BLOBs
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await conn.query(
            `INSERT INTO ticket_attachments
              (ticket_id, file_name, mime_type, size, file_data)
             VALUES (?, ?, ?, ?, ?)`,
            [
              ticketId,
              file.originalname,
              file.mimetype,
              file.size,
              file.buffer,
            ]
          );
        }
      }

      await conn.commit();
      conn.release();

      const ticketSummary = {
        id: ticketId,
        title: title.trim(),
        description: description || null,
        priority,
        status: status || "todo",
        due_date: finalDueDate,
      };

      // Send email AFTER commit (so we don't lock DB)
      try {
        await sendTicketEmail({
          to: ownerEmail,
          ticket: ticketSummary,
          categoryName,
          subcategoryName,
          ownerName,
        });
      } catch (mailErr) {
        console.error("Failed to send ticket email:", mailErr);
      }

      res.json({
        id: ticketId,
        message: "Ticket created successfully with attachments",
      });
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {}
      conn.release();
      console.error("Create ticket error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ======================
      UPDATE TICKET
   ====================== */

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

      // allow updating category mapping too (optional)
      category_id,
      subcategory_id,
    } = req.body;

    console.log("Ticket update payload:", req.body);

    const [result] = await pool.query(
      `UPDATE tickets
       SET
         title         = COALESCE(?, title),
         description   = COALESCE(?, description),
         status        = COALESCE(?, status),
         priority      = COALESCE(?, priority),
         due_date      = COALESCE(?, due_date),
         assigned_to   = COALESCE(?, assigned_to),
         category_id   = COALESCE(?, category_id),
         subcategory_id= COALESCE(?, subcategory_id)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        status ?? null,
        priority ?? null,
        due_date ?? null,
        assigned_to ?? null,
        category_id ?? null,
        subcategory_id ?? null,
        id,
      ]
    );

    res.json({ message: "Ticket updated", changedRows: result.affectedRows });
  } catch (err) {
    console.error("Update ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   DOWNLOAD ATTACHMENT
   ====================== */

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

/* ======================
      DELETE TICKET
   ====================== */

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
