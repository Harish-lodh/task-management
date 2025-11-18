// src/components/TicketBoardMUI.jsx
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
  Popover,
  colors,
} from "@mui/material";
import {
  PersonOutline,
  CalendarMonth,
  FlagOutlined,
  AttachFile,
  MoreHoriz,
  Add,
} from "@mui/icons-material";

// 🔹 Import from api.js
import {
  getTicketsBoard,
  getUsers,
  createTicket,
  updateTicket,
} from "../services/api";
import { initialColumns } from "../utils/index";
import { PRIORITY_RANK } from "../utils/index";
export default function TicketBoardMUI() {
  const [columns, setColumns] = useState(initialColumns);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New ticket dialog
  const [openNewTicket, setOpenNewTicket] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [ticketDetail, setTicketDetail] = useState(null);
  const [openTicketModal, setOpenTicketModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    title: "",
    assigneeId: "",
    description: "",
    assigneeName: "",
    dueDate: "",
    status: "todo", // todo | in-progress | completed
    priority: "low", // low | medium | high | urgent
    attachments: [],
  });

  // Due date dialog
  const [dueDateDialog, setDueDateDialog] = useState({
    open: false,
    columnId: "",
    taskId: null,
    value: "",
  });

  // Flag / priority menu
  const [flagMenu, setFlagMenu] = useState({
    anchorEl: null,
    task: null,
    columnId: "",
  });

  /* ========================
        LOAD TICKETS ON MOUNT
     ======================== */
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);

      const res = await getTicketsBoard();
      const data = res.data;
      const rows = Array.isArray(data) ? data : data.data || [];

      const base = {
        todo: {
          ...initialColumns.find((c) => c.id === "todo"),
          tasks: [],
        },
        "in-progress": {
          ...initialColumns.find((c) => c.id === "in-progress"),
          tasks: [],
        },
        completed: {
          ...initialColumns.find((c) => c.id === "completed"),
          tasks: [],
        },
      };

      rows.forEach((t) => {
        let colId = t.status;
        if (!["todo", "in-progress", "completed"].includes(colId)) {
          colId = "todo";
        }

        const col = base[colId];
        if (!col) return;

        col.tasks.push({
          id: t.id,
          title: t.title,
          assigneeName: t.assigned_to_name || "",
          assigneeId: t.assigned_to || null,
          dueDate: t.due_date ? String(t.due_date).slice(0, 10) : "",
          priority: t.priority || "low",
          description: t.description || "",
          attachments: t.attachments || [],
        });
      });

      // Sort tasks by priority (except completed, which will be shown as-is)
      ["todo", "in-progress"].forEach((colId) => {
        base[colId].tasks.sort(
          (a, b) =>
            (PRIORITY_RANK[b.priority] || 1) - (PRIORITY_RANK[a.priority] || 1)
        );
      });

      setColumns([base["todo"], base["in-progress"], base["completed"]]);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  /* ========================
        NEW TICKET HANDLERS
     ======================== */

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
      description: "",
      assigneeName: "",
      dueDate: "",
      status: "todo",
      priority: "low",
      attachments: [],
    });
  };

  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);
      const res = await getUsers();
      const data = res.data;
      const list = Array.isArray(data) ? data : data.data || data.users || [];
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

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) return;

    try {
      const form = new FormData();
      form.append("title", newTicket.title);
      form.append("description", newTicket.description);
      form.append("assigned_to", newTicket.assigneeId || "");
      form.append("due_date", newTicket.dueDate || "");
      form.append("status", newTicket.status);
      form.append("priority", newTicket.priority);

      newTicket.attachments.forEach((file) => {
        form.append("attachments", file);
      });

      const res = await createTicket(form);

      const ticketIdFromBackend = res.data?.id || `t-${Date.now()}`;
      const columnId = newTicket.status;

      const newTask = {
        id: ticketIdFromBackend,
        title: newTicket.title,
        description: newTicket.description,
        assigneeName: newTicket.assigneeName,
        assigneeId: newTicket.assigneeId,
        dueDate: newTicket.dueDate,
        priority: newTicket.priority || "low",
        attachments: newTicket.attachments,
      };

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;

          const updatedTasks = [newTask, ...col.tasks];

          // Sort non-completed based on priority
          if (columnId !== "completed") {
            updatedTasks.sort(
              (a, b) =>
                (PRIORITY_RANK[b.priority] || 1) -
                (PRIORITY_RANK[a.priority] || 1)
            );
          }

          return { ...col, tasks: updatedTasks };
        })
      );

      handleCloseNewTicket();
    } catch (err) {
      console.error("Failed to create ticket:", err);
      alert("Failed to create ticket. Please try again.");
    }
  };

  /* ========================
        TICKET MODAL HANDLERS
     ======================== */

  const handleOpenTicketModal = (task, status) => {
    setTicketDetail({ ...task, status });
    setOpenTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setOpenTicketModal(false);
    setTicketDetail(null);
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
        FLAG PRIORITY MENU
     ======================== */

  const openFlagMenu = (event, task, columnId) => {
    setFlagMenu({
      anchorEl: event.currentTarget,
      task,
      columnId,
    });
  };

  const closeFlagMenu = () => {
    setFlagMenu({
      anchorEl: null,
      task: null,
      columnId: "",
    });
  };

  const setTaskPriority = async (task, columnId, newPriority) => {
    if (!task) return;

    try {
      await updateTicket(task.id, { priority: newPriority });

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;

          // Completed column: do not sort by priority, just update value
          if (columnId === "completed") {
            return {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === task.id ? { ...t, priority: newPriority } : t
              ),
            };
          }

          // For todo / in-progress: update and then sort by priority rank
          const updatedTasks = col.tasks.map((t) =>
            t.id === task.id ? { ...t, priority: newPriority } : t
          );

          updatedTasks.sort(
            (a, b) =>
              (PRIORITY_RANK[b.priority] || 1) -
              (PRIORITY_RANK[a.priority] || 1)
          );

          return { ...col, tasks: updatedTasks };
        })
      );
    } catch (err) {
      console.error("Failed to update priority (flag)", err);
    } finally {
      closeFlagMenu();
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

  const moveTaskBetweenColumns = (
    prevCols,
    fromColumnId,
    toColumnId,
    taskId
  ) => {
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

      const newTasks = [movedTask, ...col.tasks];

      // Sort only if not completed
      if (toColumnId !== "completed") {
        newTasks.sort(
          (a, b) =>
            (PRIORITY_RANK[b.priority] || 1) - (PRIORITY_RANK[a.priority] || 1)
        );
      }

      return { ...col, tasks: newTasks };
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

    // Status in DB is exactly column id
    let newStatus = toColumnId;
    if (!["todo", "in-progress", "completed"].includes(newStatus)) {
      newStatus = "todo";
    }

    try {
      await updateTicket(taskId, {
        status: newStatus,
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
      <Grid
        container
        spacing={2}
        wrap="nowrap"
        sx={{ overflowX: "auto", pb: 1 }}
      >
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
                      onClick={() => handleOpenTicketModal(task, column.id)} // 🔹 whole card opens modal
                      sx={{
                        borderRadius: 1,
                        px: 1.5,
                        py: 1.25,
                        bgcolor: "white",
                        borderColor: "#e5e7eb",
                        cursor: "pointer", // pointer instead of grab since it's clickable
                      }}
                    >
                      {/* Title (no onClick needed now) */}
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

                      {/* Icons bar (flag + attachment + due date) */}
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
                          {/* Flag: disabled in completed column */}
                          {column.id !== "completed" && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation(); // 🔹 prevent opening modal when changing priority
                                openFlagMenu(e, task, column.id);
                              }}
                            >
                              <FlagOutlined
                                sx={{
                                  fontSize: 16,
                                  color:
                                    task.priority === "urgent"
                                      ? "darkred"
                                      : task.priority === "high"
                                      ? "red"
                                      : task.priority === "medium"
                                      ? "orange"
                                      : "text.disabled",
                                }}
                              />
                            </IconButton>
                          )}

                          {column.id === "completed" && (
                            <FlagOutlined
                              sx={{ fontSize: 16, color: "text.disabled" }}
                            />
                          )}

                          <AttachFile sx={{ fontSize: 16 }} />

                          {/* Due date icon to open dialog */}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // 🔹 don't open modal when setting due date
                              handleOpenDueDateDialog(column.id, task);
                            }}
                          >
                            <CalendarMonth sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Paper>
                  ))}
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
            <TextField
              label="Description"
              size="medium"
              fullWidth
              value={newTicket.description}
              onChange={handleNewTicketChange("description")}
            />
            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{
                textTransform: "none",
                color: "black",
                borderColor: "#A9A9A9", // <-- yeh sahi hai
                bgcolor: "transparent",
                "&:hover": {
                  borderColor: "black", // hover me bhi black hi rahe
                  bgcolor: "transparent", // no background on hover
                },
              }}
            >
              Upload Attachments
              <input
                hidden
                multiple
                type="file"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setNewTicket((prev) => ({ ...prev, attachments: files }));
                }}
              />
            </Button>

            {newTicket.attachments.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {newTicket.attachments.length} file(s) selected
              </Typography>
            )}

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
                <MenuItem value="completed">COMPLETED</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={newTicket.priority}
                onChange={handleNewTicketChange("priority")}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
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

      {/* Ticket Details Modal */}
      <Dialog
        open={openTicketModal}
        onClose={handleCloseTicketModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{ticketDetail?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {ticketDetail?.description && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {ticketDetail.description}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Assignee
              </Typography>
              <Typography variant="body2">
                {ticketDetail?.assigneeName || "Unassigned"}
              </Typography>
            </Box>
            {ticketDetail?.dueDate && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Due Date
                </Typography>
                <Typography variant="body2">{ticketDetail.dueDate}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Status
              </Typography>
              <Typography variant="body2">
                {ticketDetail?.status?.toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Priority
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {ticketDetail?.priority?.toUpperCase()}
              </Typography>
            </Box>
            {ticketDetail?.attachments?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Attachments ({ticketDetail.attachments.length})
                </Typography>
                <Stack spacing={1}>
                  {ticketDetail.attachments.map((attachment, index) => (
                    <Typography key={index} variant="body2" color="primary">
                      {typeof attachment === "object"
                        ? attachment.name || `Attachment ${index + 1}`
                        : attachment}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTicketModal}>Close</Button>
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

      {/* Flag / Priority Popover */}
      <Popover
        open={Boolean(flagMenu.anchorEl)}
        anchorEl={flagMenu.anchorEl}
        onClose={closeFlagMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Stack sx={{ p: 1, minWidth: 140 }}>
          <Button
            onClick={() =>
              setTaskPriority(flagMenu.task, flagMenu.columnId, "urgent")
            }
            sx={{ justifyContent: "flex-start", color: "darkred" }}
          >
            🚨 Urgent
          </Button>
          <Button
            onClick={() =>
              setTaskPriority(flagMenu.task, flagMenu.columnId, "high")
            }
            sx={{ justifyContent: "flex-start", color: "red" }}
          >
            🔥 High
          </Button>
          <Button
            onClick={() =>
              setTaskPriority(flagMenu.task, flagMenu.columnId, "medium")
            }
            sx={{ justifyContent: "flex-start", color: "orange" }}
          >
            ⭐ Medium
          </Button>
          <Button
            onClick={() =>
              setTaskPriority(flagMenu.task, flagMenu.columnId, "low")
            }
            sx={{ justifyContent: "flex-start", color: "gray" }}
          >
            ▪ Low
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}