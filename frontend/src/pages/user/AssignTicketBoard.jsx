// src/pages/UserTicketBoard.jsx
import { useState, useEffect } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

import {
  getTicketsBoard,
  createTicket,
  updateTicket,
  getTicketCategories,
  getTicketSubcategories,
  getUsers,              // 👈 import this
} from "../../services/api";
import { initialColumns, PRIORITY_RANK } from "../../utils/index";

import TicketColumn from "../../components/tickets/TicketColumn";
import NewTicketDialog from "../../components/tickets/NewTicketDialog";
import TicketDetailsDialog from "../../components/tickets/TicketDetailsDialog";
import DueDateDialog from "../../components/tickets/DueDateDialog";
import PriorityPopover from "../../components/tickets/PriorityPopover";

export default function UserTicketBoard() {
  /* ========================
        CURRENT USER
     ======================== */
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  /* ========================
        STATE
     ======================== */

  const [columns, setColumns] = useState(initialColumns);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New ticket dialog
  const [openNewTicket, setOpenNewTicket] = useState(false);

  // 🔹 full users list (not just current user)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Category masters
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [ticketDetail, setTicketDetail] = useState(null);
  const [openTicketModal, setOpenTicketModal] = useState(false);

  const [newTicket, setNewTicket] = useState(() => ({
    title: "",
    assigneeId:"",// currentUser?.id || "", // default self
    description: "",
    assigneeName:
      currentUser?.name ||
      currentUser?.fullName ||
      currentUser?.email ||
      "",
    dueDate: "",
    status: "todo",
    priority: "low",
    attachments: [],
    categoryId: "",
    subcategoryId: "",
  }));

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
        LOAD TICKETS & MASTERS
     ======================== */
  useEffect(() => {
    // For user: load only their tickets (if we have id)
    if (currentUser?.id) {
      loadTickets(currentUser.id);
    } else {
      loadTickets();
    }

    loadCategories();
    fetchUsersList();       // 👈 load all users for assignee dropdown
  }, [currentUser?.id]);

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

  const loadTickets = async (assigneeId = null) => {
    try {
      setLoadingTickets(true);

      const params = {};
      if (assigneeId) {
        params.assigneeId = assigneeId;
      }
      const res = await getTicketsBoard({ type: "assigned" })
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
          categoryName: t.category_name || "",
          subcategoryName: t.subcategory_name || "",
        });
      });

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

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await getTicketCategories();
      const data = res.data;
      const list = Array.isArray(data) ? data : data.data || [];
      setCategories(list);
    } catch (err) {
      console.error("Failed to load ticket categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      setLoadingSubcategories(true);
      const res = await getTicketSubcategories(categoryId);
      const data = res.data;
      const list = Array.isArray(data) ? data : data.data || [];
      setSubcategories(list);
    } catch (err) {
      console.error("Failed to load ticket subcategories", err);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  /* ========================
        NEW TICKET HANDLERS
     ======================== */

  const handleOpenNewTicket = () => {
    setOpenNewTicket(true);

    // default self as assignee
    // if (currentUser) {
    //   setNewTicket((prev) => ({
    //     ...prev,
    //     assigneeId: currentUser.id,
    //     assigneeName:
    //       currentUser.name || currentUser.fullName || currentUser.email || "",
    //   }));
    // }

    if (categories.length === 0) {
      loadCategories();
    }
    if (users.length === 0) {
      fetchUsersList();
    }
  };

  const handleCloseNewTicket = () => {
    setOpenNewTicket(false);
    setNewTicket({
      title: "",
      assigneeId:"",// currentUser?.id || "",
      description: "",
      assigneeName:
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.email ||
        "",
      dueDate: "",
      status: "todo",
      priority: "low",
      attachments: [],
      categoryId: "",
      subcategoryId: "",
    });
    setSubcategories([]);
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

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setNewTicket((prev) => ({
      ...prev,
      categoryId,
      subcategoryId: "",
    }));
    loadSubcategories(categoryId);
  };

  const handleSubcategoryChange = (event) => {
    const subcategoryId = event.target.value;
    setNewTicket((prev) => ({
      ...prev,
      subcategoryId,
    }));

    const sc = subcategories.find(
      (s) => String(s.id) === String(subcategoryId)
    );
    if (sc && sc.owner_name) {
      console.log("Default owner:", sc.owner_name);
    }
  };

//   const handleCreateTicket = async () => {
//     if (!newTicket.title.trim()) return;

//     try {
//       const form = new FormData();
//       form.append("title", newTicket.title);
//       form.append("description", newTicket.description);

//  // ✅ Only send if user actually selected an assignee
//      if (newTicket.assigneeId) {
//       form.append("assigned_to", newTicket.assigneeId);
//     }

//       form.append("due_date", newTicket.dueDate || "");
//       form.append("status", newTicket.status);
//       form.append("priority", newTicket.priority);
//       form.append("category_id", newTicket.categoryId || "");
//       form.append("subcategory_id", newTicket.subcategoryId || "");

//       newTicket.attachments.forEach((file) => {
//         form.append("attachments", file);
//       });

//       const res = await createTicket(form);

//       const ticketIdFromBackend = res.data?.id || `t-${Date.now()}`;
//       const columnId = newTicket.status;

//       // pick name from users list if exists
//       const assigneeUser =
//         users.find((u) => String(u.id) === String(finalAssigneeId)) ||
//         currentUser;

//       const newTask = {
//         id: ticketIdFromBackend,
//         title: newTicket.title,
//         description: newTicket.description,
//         assigneeName:
//           assigneeUser?.name ||
//           assigneeUser?.fullName ||
//           assigneeUser?.email ||
//           newTicket.assigneeName,
//         assigneeId: finalAssigneeId,
//         dueDate: newTicket.dueDate,
//         priority: newTicket.priority || "low",
//         attachments: newTicket.attachments,
//       };

//       setColumns((prev) =>
//         prev.map((col) => {
//           if (col.id !== columnId) return col;

//           const updatedTasks = [newTask, ...col.tasks];

//           if (columnId !== "completed") {
//             updatedTasks.sort(
//               (a, b) =>
//                 (PRIORITY_RANK[b.priority] || 1) -
//                 (PRIORITY_RANK[a.priority] || 1)
//             );
//           }

//           return { ...col, tasks: updatedTasks };
//         })
//       );

//       handleCloseNewTicket();
//     } catch (err) {
//       console.error("Failed to create ticket:", err);
//       alert("Failed to create ticket. Please try again.");
//     }
//   };
const handleCreateTicket = async () => {
  if (!newTicket.title.trim()) return;

  try {
    const form = new FormData();
    form.append("title", newTicket.title);
    form.append("description", newTicket.description);

    // ✅ Only send if user actually selected an assignee
    if (newTicket.assigneeId) {
      form.append("assigned_to", newTicket.assigneeId);
    }

    form.append("due_date", newTicket.dueDate || "");
    form.append("status", newTicket.status);
    form.append("priority", newTicket.priority);
    form.append("category_id", newTicket.categoryId || "");
    form.append("subcategory_id", newTicket.subcategoryId || "");

    newTicket.attachments.forEach((file) => {
      form.append("attachments", file);
    });

    const res = await createTicket(form);

    const ticketIdFromBackend = res.data?.id || `t-${Date.now()}`;
    const columnId = newTicket.status;

    // 👇 Use selected assignee *only if* present
    const selectedAssigneeId = newTicket.assigneeId || null;

    const assigneeUser = selectedAssigneeId
      ? users.find((u) => String(u.id) === String(selectedAssigneeId))
      : null;

    const newTask = {
      id: ticketIdFromBackend,
      title: newTicket.title,
      description: newTicket.description,
      assigneeName:
        assigneeUser?.name ||
        assigneeUser?.fullName ||
        assigneeUser?.email ||
        "",                  // empty if no assignee
      assigneeId: selectedAssigneeId, // null if not selected
      dueDate: newTicket.dueDate,
      priority: newTicket.priority || "low",
      attachments: newTicket.attachments,
    };

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;

        const updatedTasks = [newTask, ...col.tasks];

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

          if (columnId === "completed") {
            return {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === task.id ? { ...t, priority: newPriority } : t
              ),
            };
          }

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

      if (toColumnId !== "completed") {
        newTasks.sort(
          (a, b) =>
            (PRIORITY_RANK[b.priority] || 1) -
            (PRIORITY_RANK[a.priority] || 1)
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

    setColumns((prevCols) =>
      moveTaskBetweenColumns(prevCols, fromColumnId, toColumnId, taskId)
    );

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

  /* ========================
            RENDER
     ======================== */

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
            Assign Tickets
          </Typography>
          {loadingTickets && (
            <Typography variant="caption" color="text.secondary">
              Loading tickets...
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleOpenNewTicket}
          sx={{
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "white",
               fontWeight: "bold", 
              color: "#1E40AF",
              boxShadow: 0,
              "&:hover": { backgroundColor: "#f9fafb" },
            }}
          >
            New Ticket
          </Button>
        </Box>
      </Box>

      {/* Board */}
      <Grid
        container
        spacing={2}
        wrap="nowrap"
        sx={{ overflowX: "auto", pb: 1 }}
      >
        {columns.map((column) => (
          <TicketColumn
            key={column.id}
            column={column}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onTaskClick={handleOpenTicketModal}
            onOpenDueDateDialog={handleOpenDueDateDialog}
            onOpenFlagMenu={openFlagMenu}
            onOpenNewTicket={handleOpenNewTicket}
          />
        ))}
      </Grid>

      {/* New Ticket Dialog */}
      <NewTicketDialog
        open={openNewTicket}
        onClose={handleCloseNewTicket}
        newTicket={newTicket}
        users={users} // 👈 now full list, default selected = current user
        categories={categories}
        subcategories={subcategories}
        loadingUsers={loadingUsers}
        loadingCategories={loadingCategories}
        loadingSubcategories={loadingSubcategories}
        onFieldChange={handleNewTicketChange}
        onAssigneeChange={handleAssigneeChange}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        onAttachmentsChange={(files) =>
          setNewTicket((prev) => ({ ...prev, attachments: files }))
        }
        onCreate={handleCreateTicket}
      />

      {/* Ticket Details Modal */}
      <TicketDetailsDialog
        open={openTicketModal}
        ticketDetail={ticketDetail}
        onClose={handleCloseTicketModal}
      />

      {/* Due Date Dialog */}
      <DueDateDialog
        open={dueDateDialog.open}
        value={dueDateDialog.value}
        onChange={handleDueDateChange}
        onClose={handleCloseDueDateDialog}
        onSave={handleSaveDueDate}
      />

      {/* Flag / Priority Popover */}
      <PriorityPopover
        flagMenu={flagMenu}
        onClose={closeFlagMenu}
        onSelectPriority={setTaskPriority}
      />
    </div>
  );
}
