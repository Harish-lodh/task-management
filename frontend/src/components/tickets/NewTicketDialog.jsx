// src/components/tickets/NewTicketDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
export default function NewTicketDialog({
  open,
  onClose,
  newTicket,
  users,
  categories,
  subcategories,
  loadingUsers,
  loadingCategories,
  loadingSubcategories,
  onFieldChange,
  onAssigneeChange,
  onCategoryChange,
  onSubcategoryChange,
  onAttachmentsChange,
  onCreate,
}) {

  const [currentUser] = useState(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    return data;
  });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Ticket</DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 0 }}>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Incident"
            size="small"
            fullWidth
            value={newTicket.title}
            onChange={onFieldChange("title")}
          />

          {/* Category */}
          <FormControl size="small" fullWidth>
            <InputLabel id="category-label">
              {loadingCategories ? "Loading categories..." : "Category"}
            </InputLabel>
            <Select
              labelId="category-label"
              label={loadingCategories ? "Loading categories..." : "Category"}
              value={newTicket.categoryId}
              onChange={onCategoryChange}
              disabled={loadingCategories}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subcategory */}
          <FormControl
            size="small"
            fullWidth
            disabled={!newTicket.categoryId}
          >
            <InputLabel id="subcategory-label">
              {loadingSubcategories ? "Loading subcategories..." : "Subcategory"}
            </InputLabel>
            <Select
              labelId="subcategory-label"
              label={
                loadingSubcategories
                  ? "Loading subcategories..."
                  : "Subcategory"
              }
              value={newTicket.subcategoryId}
              onChange={onSubcategoryChange}
            >
              {subcategories.map((sc) => (
                <MenuItem key={sc.id} value={sc.id}>
                  {sc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Description"
            size="medium"
            fullWidth
            value={newTicket.description}
            onChange={onFieldChange("description")}
          />

          <Button
            variant="outlined"
            component="label"
            size="small"
            sx={{
              textTransform: "none",
              color: "black",
              borderColor: "#A9A9A9",
              bgcolor: "transparent",
              "&:hover": {
                borderColor: "black",
                bgcolor: "transparent",
              },
            }}
          >
            Upload Attachments
            <input
              hidden
              multiple
              type="file"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onAttachmentsChange(files);
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
              {loadingUsers ? "Loading users..." : "Assignee (optional)"}
            </InputLabel>
            <Select
              labelId="assignee-label"
              label={loadingUsers ? "Loading users..." : "Assignee (optional)"}
              value={newTicket.assigneeId}
              onChange={onAssigneeChange}
              disabled={loadingUsers}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name || user.fullName || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(currentUser?.role).toLowerCase() !== "user" && (
            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTicket.dueDate}
              onChange={onFieldChange("dueDate")}
            />)}

          {/* <FormControl size="small" fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={newTicket.status}
              onChange={onFieldChange("status")}
            >
              <MenuItem value="todo">TO DO</MenuItem>
              <MenuItem value="in-progress">IN PROGRESS</MenuItem>
              <MenuItem value="completed">COMPLETED</MenuItem>
            </Select>
          </FormControl> */}

          <FormControl size="small" fullWidth>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              label="Priority"
              value={newTicket.priority}
              onChange={onFieldChange("priority")}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
