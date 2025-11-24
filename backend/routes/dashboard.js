// routes/dashboard.js
import { Router } from "express";
import pool from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/dashboard/tickets
 * Overall ticket stats for dashboard
 *
 * Optional query params (for future use):
 *   - assigneeId: filter tickets for a specific user (for ADMIN/MANAGER)
 */
router.get("/", authRequired, async (req, res) => {
  try {
    const { assigneeId } = req.query;

    const baseWhere = [];
    const baseParams = [];

    // visibility rules: same logic as /board
    if (req.user.role === "USER") {
      // normal users only see tickets assigned to themselves
      baseWhere.push("t.assigned_to = ?");
      baseParams.push(req.user.id);
    } else if (assigneeId) {
      // ADMIN / MANAGER can filter for a specific assignee
      baseWhere.push("t.assigned_to = ?");
      baseParams.push(assigneeId);
    }

    const whereClause = baseWhere.length
      ? "WHERE " + baseWhere.join(" AND ")
      : "";

    /* ---------- TOTAL TICKETS ---------- */
    const [rowsTotal] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM tickets t
       ${whereClause}`,
      baseParams
    );
    const totalTickets = rowsTotal[0]?.total || 0;

    /* ---------- BY STATUS ---------- */
    const [rowsStatus] = await pool.query(
      `SELECT t.status, COUNT(*) AS count
       FROM tickets t
       ${whereClause}
       GROUP BY t.status`,
      baseParams
    );

    const statusCounts = {
      todo: 0,
      inProgress: 0,
      completed: 0,
    };

    rowsStatus.forEach((r) => {
      const s = (r.status || "").toLowerCase();
      if (s === "todo") statusCounts.todo = r.count;
      else if (s === "in-progress") statusCounts.inProgress = r.count;
      else if (s === "completed") statusCounts.completed = r.count;
    });

    /* ---------- BY PRIORITY ---------- */
    const [rowsPriority] = await pool.query(
      `SELECT t.priority, COUNT(*) AS count
       FROM tickets t
       ${whereClause}
       GROUP BY t.priority`,
      baseParams
    );

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    rowsPriority.forEach((r) => {
      const p = (r.priority || "").toLowerCase();
      if (priorityCounts[p] !== undefined) {
        priorityCounts[p] = r.count;
      }
    });

    /* ---------- OVERDUE (due_date < today AND not completed) ---------- */
    const overdueWhere = [...baseWhere];
    const overdueParams = [...baseParams];

    overdueWhere.push(
      "t.due_date IS NOT NULL",
      "t.due_date < CURDATE()",
      "t.status <> 'completed'"
    );

    const overdueWhereClause =
      "WHERE " + overdueWhere.join(" AND ");

    const [rowsOverdue] = await pool.query(
      `SELECT COUNT(*) AS overdueCount
       FROM tickets t
       ${overdueWhereClause}`,
      overdueParams
    );

    const overdueCount = rowsOverdue[0]?.overdueCount || 0;

    /* ---------- CREATED DATE BUCKETS (today / last 7 / last 30) ---------- */
    const [rowsCreated] = await pool.query(
      `SELECT
         SUM(CASE WHEN DATE(t.created_at) = CURDATE() THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS last7Days,
         SUM(CASE WHEN t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS last30Days
       FROM tickets t
       ${whereClause}`,
      baseParams
    );

    const createdCounts = {
      today: rowsCreated[0]?.today || 0,
      last7Days: rowsCreated[0]?.last7Days || 0,
      last30Days: rowsCreated[0]?.last30Days || 0,
    };

    /* ---------- BY CATEGORY ---------- */
    const [rowsCategory] = await pool.query(
      `SELECT 
         tc.id AS categoryId,
         COALESCE(tc.name, 'Uncategorized') AS categoryName,
         COUNT(*) AS count
       FROM tickets t
       LEFT JOIN ticket_categories tc ON tc.id = t.category_id
       ${whereClause}
       GROUP BY tc.id, categoryName
       ORDER BY count DESC`,
      baseParams
    );

    const byCategory = rowsCategory.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      count: r.count,
    }));

    /* ---------- TOP ASSIGNEES ---------- */
    const [rowsAssignees] = await pool.query(
      `SELECT
         t.assigned_to AS userId,
         COALESCE(u.name, 'Unassigned') AS name,
         COUNT(*) AS count
       FROM tickets t
       LEFT JOIN users u ON u.id = t.assigned_to
       ${whereClause}
       GROUP BY t.assigned_to, name
       ORDER BY count DESC
       LIMIT 5`,
      baseParams
    );

    const topAssignees = rowsAssignees.map((r) => ({
      userId: r.userId,
      name: r.name,
      count: r.count,
    }));

    /* ---------- RESPONSE ---------- */
    res.json({
      totalTickets,
      statusCounts,
      priorityCounts,
      overdueCount,
      createdCounts,
      byCategory,
      topAssignees,
    });
  } catch (err) {
    console.error("Dashboard tickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
