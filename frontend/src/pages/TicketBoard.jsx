import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  PersonOutline,
  CalendarMonth,
  FlagOutlined,
  AttachFile,
  MoreHoriz,
  Add,
} from "@mui/icons-material";

// 🔹 Import from api.js (adjust path if needed)
import {
  getTicketsBoard,
  getUsers,
  createTicket,
  updateTicket,
} from "../services/api";

const initialColumns = [
  {
    id: "todo",
    title: "TO DO",
    countColor: "#1e293b",
    headerBg: "#f8fafc",
    accent: "#cbd5f5",
    tasks: [],
  },
  {
    id: "in-progress",
    title: "IN PROGRESS",
    countColor: "#2563eb",
    headerBg: "#ffffff",
    accent: "#0000ff",
    tasks: [],
  },
  {
    id: "complete",
    title: "COMPLETE",
    countColor: "#059669",
    headerBg: "#ffffff",
    accent: "#00cc00",
    tasks: [],
  },
];

export default function TicketBoardMUI() {
  const [columns, setColumns] = useState(initialColumns);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New ticket dialog state
  const [openNewTicket, setOpenNewTicket] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [newTicket, setNewTicket] = useState({
    title: "",
    assigneeId: "",
    assigneeName: "",
    dueDate: "",
    status: "todo", // which column
  });

  // Due date setter dialog state
  const [dueDateDialog, setDueDateDialog] = useState({
    open: false,
    columnId: "",
    taskId: null,
    value: "",
  });

  /* ========================
        LOAD TICKETS ON MOUNT
     ======================== */
  useEffect(() => {
    loadTickets();
  }, []);

  const normalizeStatusClient = (raw) => {
    if (!raw) return "todo";
    const s = String(raw).toLowerCase().trim();

    if (s === "todo" || s === "to do" || s === "backlog") return "todo";
    if (s === "in-progress" || s === "in progress" || s.includes("progress"))
      return "in-progress";
    if (s === "complete" || s === "completed" || s === "done")
      return "complete";

    return "todo";
  };

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);

      const res = await getTicketsBoard();
      const data = res.data;

      const rows = Array.isArray(data) ? data : data.data || [];

      // Base columns copy with empty tasks
      const base = {
        todo: {
          ...initialColumns.find((c) => c.id === "todo"),
          tasks: [],
        },
        "in-progress": {
          ...initialColumns.find((c) => c.id === "in-progress"),
          tasks: [],
        },
        complete: {
          ...initialColumns.find((c) => c.id === "complete"),
          tasks: [],
        },
      };

      rows.forEach((t) => {
        const colId = normalizeStatusClient(t.status);
        const col = base[colId];
        if (!col) return;

        col.tasks.push({
          id: t.id,
          title: t.title,
          assigneeName: t.assigned_to_name || "",
          assigneeId: t.assigned_to || null,
          dueDate: t.end_date ? String(t.end_date).slice(0, 10) : "",
        });
      });

      setColumns([base["todo"], base["in-progress"], base["complete"]]);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleOpenNewTicket = () => {
    setOpenNewTicket(true);
    if (users.length === 0) {
      fetchUsersList();
    }
  };

  const handleCloseNewTicket = () => {
    setOpenNewTicket(false);
    setNewTicket({
      title: "",
      assigneeId: "",
      assigneeName: "",
      dueDate: "",
      status: "todo",
    });
  };

  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);

      const res = await getUsers();
      console.log("USER API RESPONSE:", res.data);

      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data.data || data.users || [];

      setUsers(list);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleNewTicketChange = (field) => (event) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAssigneeChange = (event) => {
    const assigneeId = event.target.value;
    const user = users.find((u) => String(u.id) === String(assigneeId));
    setNewTicket((prev) => ({
      ...prev,
      assigneeId,
      assigneeName: user ? user.name || user.fullName || user.email : "",
    }));
  };

  /* ========================
        CREATE TICKET (API)
     ======================== */
  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) return;

    try {
      const payload = {
        title: newTicket.title,
        description: "",
        assigned_to: newTicket.assigneeId || null,
        due_date: newTicket.dueDate || null,
        status: newTicket.status, // "todo" | "in-progress" | "complete"
      };

      const res = await createTicket(payload);

      console.log("TICKET CREATED:", res.data);

      const ticketIdFromBackend = res.data?.id || `t-${Date.now()}`;
      const columnId = newTicket.status;

      const newTask = {
        id: ticketIdFromBackend,
        title: newTicket.title,
        assigneeName: newTicket.assigneeName,
        assigneeId: newTicket.assigneeId,
        dueDate: newTicket.dueDate,
      };

      const updatedColumns = columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [newTask, ...col.tasks] }
          : col
      );

      setColumns(updatedColumns);
      handleCloseNewTicket();
    } catch (err) {
      console.error("Failed to create ticket:", err);
      alert("Failed to create ticket. Please try again.");
    }
  };

  /* ========================
        DUE DATE DIALOG
     ======================== */

  const handleOpenDueDateDialog = (columnId, task) => {
    setDueDateDialog({
      open: true,
      columnId,
      taskId: task.id,
      value: task.dueDate || "",
    });
  };

  const handleCloseDueDateDialog = () => {
    setDueDateDialog({
      open: false,
      columnId: "",
      taskId: null,
      value: "",
    });
  };

  const handleDueDateChange = (e) => {
    const value = e.target.value;
    setDueDateDialog((prev) => ({
      ...prev,
      value,
    }));
  };

  const handleSaveDueDate = async () => {
    if (!dueDateDialog.taskId) return;

    try {
      await updateTicket(dueDateDialog.taskId, {
        due_date: dueDateDialog.value || null,
      });

      // Update local board state
      setColumns((prevCols) =>
        prevCols.map((col) => {
          if (col.id !== dueDateDialog.columnId) return col;
          return {
            ...col,
            tasks: col.tasks.map((t) =>
              t.id === dueDateDialog.taskId
                ? { ...t, dueDate: dueDateDialog.value }
                : t
            ),
          };
        })
      );

      handleCloseDueDateDialog();
    } catch (err) {
      console.error("Failed to update due date:", err);
      alert("Failed to update due date. Please try again.");
    }
  };

  /* ========================
        DRAG & DROP
     ======================== */

  const handleDragStart = (e, fromColumnId, taskId) => {
    const payload = JSON.stringify({ fromColumnId, taskId });
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.setData("text/plain", payload);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const moveTaskBetweenColumns = (prevCols, fromColumnId, toColumnId, taskId) => {
    let movedTask = null;

    const colsAfterRemoval = prevCols.map((col) => {
      if (col.id !== fromColumnId) return col;
      const remaining = [];
      col.tasks.forEach((t) => {
        if (t.id === taskId) {
          movedTask = t;
        } else {
          remaining.push(t);
        }
      });
      return { ...col, tasks: remaining };
    });

    if (!movedTask) return prevCols;

    return colsAfterRemoval.map((col) => {
      if (col.id !== toColumnId) return col;
      return { ...col, tasks: [movedTask, ...col.tasks] };
    });
  };

  const handleDrop = async (e, toColumnId) => {
    e.preventDefault();
    const dataStr =
      e.dataTransfer.getData("application/json") ||
      e.dataTransfer.getData("text/plain");
    if (!dataStr) return;

    let data;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }

    const { fromColumnId, taskId } = data || {};
    if (!taskId || !fromColumnId || fromColumnId === toColumnId) return;

    // Update UI first
    setColumns((prevCols) =>
      moveTaskBetweenColumns(prevCols, fromColumnId, toColumnId, taskId)
    );

    // Hit backend
    try {
      await updateTicket(taskId, {
        status: toColumnId,
      });
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      {/* Page header */}
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Ticket Dashboard
          </Typography>
          {loadingTickets && (
            <Typography variant="caption" color="text.secondary">
              Loading tickets...
            </Typography>
          )}
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={handleOpenNewTicket}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "white",
            boxShadow: 1,
            "&:hover": { backgroundColor: "#f9fafb" },
          }}
        >
          New Ticket
        </Button>
      </Box>

      {/* Board */}
      <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: "auto", pb: 1 }}>
        {columns.map((column) => (
          <Grid
            item
            xs={12}
            md={4}
            key={column.id}
            sx={{
              minWidth: 320,
              maxWidth: 420,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                height: "70vh",
                overflow: "hidden",
              }}
            >
              {/* Column header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: column.headerBg,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: column.accent,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      color: "text.secondary",
                    }}
                  >
                    {column.title}
                  </Typography>
                  <Chip
                    label={column.tasks.length}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "white",
                    }}
                  />
                </Stack>

                <IconButton size="small">
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Box>

              {/* Tasks list (drop zone) */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 1.5,
                  bgcolor: "#f8fafc",
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <Stack spacing={1.5}>
                  {column.tasks.map((task) => (
                    <Paper
                      key={task.id}
                      variant="outlined"
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, column.id, task.id)
                      }
                      sx={{
                        borderRadius: 1,
                        px: 1.5,
                        py: 1.25,
                        bgcolor: "white",
                        borderColor: "#e5e7eb",
                        cursor: "grab",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        {task.title}
                      </Typography>

                      {/* Assignee + due date display */}
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={0.5}
                      >
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          sx={{ color: "text.secondary" }}
                        >
                          <PersonOutline sx={{ fontSize: 16 }} />
                          <Typography variant="caption">
                            {task.assigneeName || "Unassigned"}
                          </Typography>
                        </Stack>

                        {task.dueDate && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{ color: "text.secondary" }}
                          >
                            <CalendarMonth sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              {task.dueDate}
                            </Typography>
                          </Stack>
                        )}
                      </Box>

                      {/* Icons bar (flag + attachment + due date icon) */}
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mt={0.25}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ color: "text.disabled" }}
                        >
                          <FlagOutlined sx={{ fontSize: 16 }} />
                          <AttachFile sx={{ fontSize: 16 }} />

                          {/* Due date icon to open dialog */}
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleOpenDueDateDialog(column.id, task)
                            }
                          >
                            <CalendarMonth sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Paper>
                  ))}

                  {column.tasks.length === 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 1,
                        borderStyle: "dashed",
                        borderRadius: 1,
                        p: 2,
                        textAlign: "center",
                        bgcolor: "#f9fafb",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        No tasks here yet.
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* Add task footer */}
              <Button
                startIcon={<Add sx={{ fontSize: 18 }} />}
                onClick={handleOpenNewTicket}
                sx={{
                  borderRadius: 0,
                  py: 1,
                  px: 2,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2563eb",
                  "&:hover": { bgcolor: "#eff6ff" },
                }}
              >
                Add Task
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* New Ticket Dialog */}
      <Dialog
        open={openNewTicket}
        onClose={handleCloseNewTicket}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0 }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              size="small"
              fullWidth
              value={newTicket.title}
              onChange={handleNewTicketChange("title")}
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="assignee-label">
                {loadingUsers ? "Loading users..." : "Assignee"}
              </InputLabel>
              <Select
                labelId="assignee-label"
                label={loadingUsers ? "Loading users..." : "Assignee"}
                value={newTicket.assigneeId}
                onChange={handleAssigneeChange}
                disabled={loadingUsers}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.fullName || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTicket.dueDate}
              onChange={handleNewTicketChange("dueDate")}
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={newTicket.status}
                onChange={handleNewTicketChange("status")}
              >
                <MenuItem value="todo">TO DO</MenuItem>
                <MenuItem value="in-progress">IN PROGRESS</MenuItem>
                <MenuItem value="complete">COMPLETE</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseNewTicket}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTicket}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Due Date Dialog */}
      <Dialog
        open={dueDateDialog.open}
        onClose={handleCloseDueDateDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Set Due Date</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0 }}>
          <TextField
            label="Due Date"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dueDateDialog.value}
            onChange={handleDueDateChange}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDueDateDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDueDate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
