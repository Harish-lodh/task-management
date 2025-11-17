import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import apiClient from "../services/apiClient";

// helper: convert old labels ("TO DO") → backend values ("todo")
const normalizeStatus = (value) => {
  if (!value) return "todo";
  const v = value.toLowerCase();
  if (v.includes("progress")) return "progress";
  if (v.includes("complete")) return "completed";
  if (v.includes("todo") || v.includes("to do")) return "todo";
  return "todo";
};

const CreateTicket = ({ open, onClose, defaultStatus }) => {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(""); // will store user.id
  const [status, setStatus] = useState(normalizeStatus(defaultStatus));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // update status when column default changes
  useEffect(() => {
    setStatus(normalizeStatus(defaultStatus));
  }, [defaultStatus]);

  // load users when dialog opens
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await apiClient.get("/users");
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setAssignee("");
    setStatus(normalizeStatus(defaultStatus));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/tickets", {
        title: title.trim(),
        assigned_to: assignee || null, // user.id or null
        status, // "todo" | "progress" | "completed"
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error("Create ticket error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to create task. Check console / backend logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };


  ////modal or popup
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />

        {/* Assignee dropdown using users from API */}
        <FormControl fullWidth margin="dense" className="mb-4">
          <InputLabel id="assignee-label">Assignee</InputLabel>
          <Select
            labelId="assignee-label"
            value={assignee}
            label="Assignee"
            onChange={(e) => setAssignee(e.target.value)}
          >
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="todo">TO DO</MenuItem>
            <MenuItem value="progress">IN PROGRESS</MenuItem>
            <MenuItem value="completed">COMPLETE</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? "Creating..." : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicket;
