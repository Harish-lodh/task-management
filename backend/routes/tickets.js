// routes/tickets.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import multer from "multer";
import { sendTicketEmail, sendTicketCompletedEmail } from "../utils/sendEmail.js";


const upload = multer({ storage: multer.memoryStorage() });

const router = Router();



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
// router.get("/board", authRequired, async (req, res) => {
//   try {
//     const { assigneeId } = req.query; // NEW

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
//     const where = [];

//     // If normal USER => always see own tickets only (keep old behavior)
//     if (req.user.role === "USER") {
//       where.push("t.assigned_to = ?");
//       params.push(req.user.id);
//     } else if (assigneeId) {
//       // For ADMIN / MANAGER allow filter by assignee
//       where.push("t.assigned_to = ?");
//       params.push(assigneeId);
//     }

//     if (where.length) {
//       sql += " WHERE " + where.join(" AND ");
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
// router.get("/board", authRequired, async (req, res) => {
//   try {
//     const { assigneeId } = req.query;

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
//       WHERE 1 = 1
//     `;

//     const params = [];

//     /* ==========================
//          ROLE BASED RULES
//        ========================== */

//     if (req.user.role === "USER") {
//       // Normal user → only own tickets
//       sql += ` AND t.assigned_to = ? `;
//       params.push(req.user.id);
//     }

//     if (req.user.role === "ADMIN") {
//       // Admin → full access
//       sql += `
//       GROUP BY t.id
//       ORDER BY t.created_at DESC
//     `;
//     }



//     const [rows] = await pool.query(sql, params);

//     const cleanRows = rows.map((t) => {
//       let files = [];
//       if (t.attachments) {
//         try {
//           files = JSON.parse(t.attachments);
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
router.get("/board", authRequired, async (req, res) => {
  try {
    const { type, assigneeId } = req.query;
    console.log(type)
    let sql = `
      SELECT 
        t.*, 
        u1.name AS created_by_name,
        u2.name AS assigned_to_name,
        tc.name AS category_name,
        ts.name AS subcategory_name,
        JSON_ARRAYAGG(
          JSON_OBJECT('id', ta.id, 'file_name', ta.file_name, 'mime_type', ta.mime_type, 'size', ta.size)
        ) AS attachments
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      LEFT JOIN ticket_attachments ta ON ta.ticket_id = t.id
      LEFT JOIN ticket_categories tc ON tc.id = t.category_id
      LEFT JOIN ticket_subcategories ts ON ts.id = t.subcategory_id
      WHERE 1 = 1
    `;
    const userId = assigneeId ? assigneeId : req.user.id;
    const params = [];
    console.log("id-->", userId)
    // 🎯 Add new filters
    if (type === "created") {
      sql += ` AND t.created_by = ? `;
      params.push(userId);
    }

    if (type === "assigned") {
      sql += ` AND t.assigned_to = ? `;
      params.push(userId);
    }

    sql += ` GROUP BY t.id ORDER BY t.created_at DESC `;
    console.log("sql and params", params)
    const [rows] = await pool.query(sql, params);

    const cleanRows = rows.map((t) => {
      let files = [];
      if (t.attachments) {
        try {
          files = JSON.parse(t.attachments);
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================
      CREATE TICKET
   ====================== */

/* ---------- POST /api/tickets/create-ticket ---------- */
// router.post(
//   "/create-ticket",
//   authRequired,
//   upload.array("attachments"),
//   async (req, res) => {
//     const conn = await pool.getConnection();

//     try {
//       const {
//         title,
//         description,
//         assigned_to,
//         due_date,
//         priority = "low",
//         status,

//         // NEW FIELDS from frontend FormData
//         category_id,
//         subcategory_id,
//       } = req.body;
//       console.log(req.body)

//       if (!title || !title.trim()) {
//         conn.release();
//         return res.status(400).json({ message: "Title is required" });
//       }
//     console.log("before assigner",assigned_to)
//       const created_by = req.user.id;

//       let assignedToFinal = assigned_to || null;
//       let ownerEmail = null;
//       let ownerName = null;
//       let categoryName = null;
//       let subcategoryName = null;

//       await conn.beginTransaction();

//       // If no explicit assignee, try from subcategory mapping
//       if (!assignedToFinal && subcategory_id) {
//         const [rows] = await conn.query(
//           `SELECT 
//              ts.default_owner_user_id,
//              ts.default_owner_email,
//              ts.name AS subcategory_name,
//              tc.name AS category_name,
//              u.email AS user_email,
//              u.name AS user_name
//            FROM ticket_subcategories ts
//            JOIN ticket_categories tc ON tc.id = ts.category_id
//            LEFT JOIN users u ON ts.default_owner_user_id = u.id
//            WHERE ts.id = ?`,
//           [subcategory_id]
//         );// auto assign the user by default_owner_user_id to id in users table and take email aslo for assign to them

//         if (rows.length > 0) {
//           const r = rows[0];
//           categoryName = r.category_name;
//           subcategoryName = r.subcategory_name;

//           if (r.default_owner_user_id) {
//             assignedToFinal = r.default_owner_user_id;
//           }

//           ownerEmail = r.user_email || r.default_owner_email;
//           ownerName = r.user_name;
//         }
//       }
//       console.log("after checking in categry",assigned_to)

//       // If still no email/owner info but we DO have assigned_toFinal,
//       // fetch that user so we can email them
//       if (assignedToFinal && !ownerEmail) {
//         const [urows] = await conn.query(
//           `SELECT email, name FROM users WHERE id = ?`,
//           [assignedToFinal]
//         );
//         if (urows.length > 0) {
//           ownerEmail = urows[0].email;
//           ownerName = urows[0].name;
//         }
//       }


//       const finalDueDate = due_date || null;

//       // STEP 1 — Insert ticket
//       const [result] = await conn.query(
//         `INSERT INTO tickets
//           (title, description, created_by, assigned_to, status, priority, due_date,
//            category_id, subcategory_id)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           title.trim(),
//           description || null,
//           created_by,
//           assignedToFinal,
//           status || "todo",
//           priority,
//           finalDueDate,
//           category_id || null,
//           subcategory_id || null,
//         ]
//       );

//       const ticketId = result.insertId;

//       // STEP 2 — Insert uploaded files as BLOBs
//       if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//           await conn.query(
//             `INSERT INTO ticket_attachments
//               (ticket_id, file_name, mime_type, size, file_data)
//              VALUES (?, ?, ?, ?, ?)`,
//             [
//               ticketId,
//               file.originalname,
//               file.mimetype,
//               file.size,
//               file.buffer,
//             ]
//           );
//         }
//       }

//       await conn.commit();
//       conn.release();

//       const ticketSummary = {
//         id: ticketId,
//         title: title.trim(),
//         description: description || null,
//         priority,
//         status: status || "todo",
//         due_date: finalDueDate,
//       };

//       // Send email AFTER commit (so we don't lock DB)
//       try {
//         await sendTicketEmail({
//           to: ownerEmail,
//           ticket: ticketSummary,
//           categoryName,
//           subcategoryName,
//           ownerName,
//         });
//       } catch (mailErr) {
//         console.error("Failed to send ticket email:", mailErr);
//       }

//       res.json({
//         id: ticketId,
//         message: "Ticket created successfully with attachments",
//       });
//     } catch (err) {
//       try {
//         await conn.rollback();
//       } catch (_) { }
//       conn.release();
//       console.error("Create ticket error:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );


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
        assigned_to,     // may be undefined if frontend didn't send
        due_date,
        priority = "low",
        status,
        category_id,
        subcategory_id,
      } = req.body;



      if (!title || !title.trim()) {
        conn.release();
        return res.status(400).json({ message: "Title is required" });
      }

      const created_by = req.user.id;

      // 👇 Start with explicit assignee if provided
      let assignedToFinal = assigned_to || null;
      let ownerEmail = null;
      let ownerName = null;
      let categoryName = null;
      let subcategoryName = null;

      await conn.beginTransaction();

      // 🔹 If no explicit assignee, try to auto-assign using subcategory default owner
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

          // ✅ auto assign the user by default_owner_user_id to tickets.assigned_to
          if (r.default_owner_user_id) {
            assignedToFinal = r.default_owner_user_id;
          }

          // ✅ get email/name for notification
          ownerEmail = r.user_email || r.default_owner_email;
          ownerName = r.user_name;
        }
      }

      // console.log("Final assignee after subcategory logic:", assignedToFinal);

      // 🔹 If we have an assignee but still no email, fetch user info
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
          assignedToFinal,         // 👈 this is either explicit assignee, default owner, or null
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
        console.log("successfull send email for ticket creation");
      } catch (mailErr) {
        console.error("Failed to send ticket email:", mailErr);
      }

      return res.json({
        id: ticketId,
        message: "Ticket created successfully with attachments",
      });
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) { }
      conn.release();
      console.error("Create ticket error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ======================
      UPDATE TICKET
   ====================== */

/* ---------- PATCH /api/tickets/:id ---------- */
// router.patch("/:id", authRequired, async (req, res) => {
//   try {
//     const id = req.params.id;
//     let {
//       title,
//       description,
//       status,
//       priority,
//       due_date,
//       assigned_to,

//       // allow updating category mapping too (optional)
//       category_id,
//       subcategory_id,
//     } = req.body;

//     console.log("Ticket update payload:", req.body);

//     const [result] = await pool.query(
//       `UPDATE tickets
//        SET
//          title         = COALESCE(?, title),
//          description   = COALESCE(?, description),
//          status        = COALESCE(?, status),
//          priority      = COALESCE(?, priority),
//          due_date      = COALESCE(?, due_date),
//          assigned_to   = COALESCE(?, assigned_to),
//          category_id   = COALESCE(?, category_id),
//          subcategory_id= COALESCE(?, subcategory_id)
//        WHERE id = ?`,
//       [
//         title ?? null,
//         description ?? null,
//         status ?? null,
//         priority ?? null,
//         due_date ?? null,
//         assigned_to ?? null,
//         category_id ?? null,
//         subcategory_id ?? null,
//         id,
//       ]
//     );

//     res.json({ message: "Ticket updated", changedRows: result.affectedRows });
//   } catch (err) {
//     console.error("Update ticket error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


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
      category_id,
      subcategory_id,
    } = req.body;

    console.log("Ticket update payload:", req.body);

    // 1️⃣ Get existing ticket before update
    const [[oldTicket]] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    if (!oldTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 2️⃣ Update ticket
    const [result] = await pool.query(
      `UPDATE tickets SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        assigned_to = COALESCE(?, assigned_to),
        category_id = COALESCE(?, category_id),
        subcategory_id = COALESCE(?, subcategory_id)
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

    // 3️⃣ If status changed to completed — send email
    const newStatus = status ?? oldTicket.status;

    if (status && oldTicket.status !== "completed" && newStatus === "completed") {
      console.log("Ticket completed — sending email...");

      // Re-load updated ticket with category & subcategory names
      const [[ticketRow]] = await pool.query(
        `SELECT 
           t.*,
           tc.name AS category_name,
           ts.name AS subcategory_name
         FROM tickets t
         LEFT JOIN ticket_categories tc ON tc.id = t.category_id
         LEFT JOIN ticket_subcategories ts ON ts.id = t.subcategory_id
         WHERE t.id = ?`,
        [id]
      );
     console.log(ticketRow)
      if (!ticketRow) {
        console.warn("Ticket not found after update for email sending");
      } else {
        // Get owner/user email (ticket creator)
        const [[owner]] = await pool.query(
          "SELECT name, email FROM users WHERE id = ?",
          [ticketRow.created_by]
        );

        await sendTicketCompletedEmail({
          to: owner?.email,
          ticket: ticketRow,      // full ticket row, no manual summary here
          ownerName: owner?.name,
        });

        console.log("Completion email sent.");
      }
    }

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
