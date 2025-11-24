import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  AssignmentRounded as AssignmentIcon,
  HourglassEmptyRounded as HourglassIcon,
  CheckCircleRounded as CheckCircleIcon,
  ErrorRounded as ErrorIcon,
  BarChartRounded as BarChartIcon,
  PriorityHighRounded as PriorityHighIcon,
  PeopleRounded as PeopleIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";

import { getTicketsBoard } from "../services/api";

export default function TicketDashboard() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    byStatus: {
      todo: 0,
      inProgress: 0,
      completed: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    overdue: 0,
    assigneeSummary: [], // { name, count }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTicketsBoard(); // same /board API
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(data);
      computeStats(data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (rows) => {
    const total = rows.length;

    const byStatus = {
      todo: 0,
      inProgress: 0,
      completed: 0,
    };

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    let overdue = 0;

    const assigneeMap = {}; // name -> count

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rows.forEach((t) => {
      // status
      const status = (t.status || "").toLowerCase();
      if (status === "todo") byStatus.todo += 1;
      else if (status === "in-progress") byStatus.inProgress += 1;
      else if (status === "completed") byStatus.completed += 1;

      // priority
      const pr = (t.priority || "").toLowerCase();
      if (byPriority[pr] !== undefined) {
        byPriority[pr] += 1;
      }

      // overdue (only if not completed and has due_date)
      if (t.due_date && status !== "completed") {
        const d = new Date(t.due_date);
        d.setHours(0, 0, 0, 0);
        if (d < today) overdue += 1;
      }

      // assignee summary
      const name =
        t.assigned_to_name ||
        t.assigneeName ||
        "Unassigned";
      if (!assigneeMap[name]) assigneeMap[name] = 0;
      assigneeMap[name] += 1;
    });

    const assigneeSummary = Object.entries(assigneeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5

    setStats({
      total,
      byStatus,
      byPriority,
      overdue,
      assigneeSummary,
    });
  };

  const percent = (value) =>
    stats.total === 0 ? 0 : Math.round((value / stats.total) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case "todo": return "secondary";
      case "in-progress": return "primary";
      case "completed": return "success";
      default: return "inherit";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "error";
      case "high": return "warning";
      case "medium": return "info";
      case "low": return "success";
      default: return "inherit";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={600}>
            Ticket Analytics
          </Typography>
        </Box>
        <IconButton onClick={loadData} disabled={loading} size="small">
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "error.lighter", borderRadius: 2 }}>
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        </Paper>
      )}

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 999 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Loading dashboard...
          </Typography>
        </Box>
      )}

      {/* Top summary cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Tickets
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="text.primary">
              {stats.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <HourglassIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Open Tickets
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={600} color="info.main">
              {stats.byStatus.todo + stats.byStatus.inProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percent(stats.byStatus.todo + stats.byStatus.inProgress)}% of total
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Completed
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={600} color="success.main">
              {stats.byStatus.completed}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percent(stats.byStatus.completed)}
              color="success"
              sx={{ mt: 1, borderRadius: 999 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
              bgcolor: stats.overdue > 0 ? "error.lighter" : "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ErrorIcon color={stats.overdue > 0 ? "error" : "success"} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Overdue
              </Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight={600}
              color={stats.overdue > 0 ? "error.main" : "success.main"}
            >
              {stats.overdue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percent(stats.overdue)}% of total
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%", boxShadow: 2, bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                By Status
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                TO DO ({stats.byStatus.todo})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byStatus.todo)}
                color={getStatusColor("todo")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byStatus.todo)}%
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                IN PROGRESS ({stats.byStatus.inProgress})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byStatus.inProgress)}
                color={getStatusColor("in-progress")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byStatus.inProgress)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                COMPLETED ({stats.byStatus.completed})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byStatus.completed)}
                color={getStatusColor("completed")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byStatus.completed)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Priority distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%", boxShadow: 2, bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PriorityHighIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                By Priority
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                URGENT ({stats.byPriority.urgent})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byPriority.urgent)}
                color={getPriorityColor("urgent")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byPriority.urgent)}%
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                HIGH ({stats.byPriority.high})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byPriority.high)}
                color={getPriorityColor("high")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byPriority.high)}%
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                MEDIUM ({stats.byPriority.medium})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byPriority.medium)}
                color={getPriorityColor("medium")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byPriority.medium)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                LOW ({stats.byPriority.low})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent(stats.byPriority.low)}
                color={getPriorityColor("low")}
                sx={{ borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percent(stats.byPriority.low)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Top assignees */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%", boxShadow: 2, bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PeopleIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Top Assignees
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {stats.assigneeSummary.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No assigned tickets yet.
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
                {stats.assigneeSummary.map((a, index) => (
                  <ListItem key={a.name} divider={index < stats.assigneeSummary.length - 1}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {a.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {a.count} ticket(s)
                        </Typography>
                      }
                    />
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LinearProgress
                        variant="determinate"
                        value={percent(a.count)}
                        sx={{ width: 60, mr: 1, borderRadius: 999 }}
                      />
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {percent(a.count)}%
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}