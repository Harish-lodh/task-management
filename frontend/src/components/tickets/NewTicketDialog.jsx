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
import { useState, useEffect } from "react";

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

  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [displayCategory, setDisplayCategory] = useState(
    newTicket.categoryId || ""
  );

  // ✅ boolean just for red border on Assignee
  const [assigneeError, setAssigneeError] = useState(false);

  useEffect(() => {
    if (newTicket.categoryId !== null && newTicket.categoryId !== undefined) {
      setDisplayCategory(newTicket.categoryId);
      setIsOtherCategory(false);
      setAssigneeError(false);
    }
  }, [newTicket.categoryId]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "other") {
      onCategoryChange({ target: { value: null } });
      setDisplayCategory("other");
      setIsOtherCategory(true);
      // don't set error here; only on create
    } else {
      onCategoryChange(e);
      setDisplayCategory(value);
      setIsOtherCategory(false);
      setAssigneeError(false); // clear error when leaving "Other"
    }
  };

  const handleAssigneeChange = (e) => {
    onAssigneeChange(e);
    setAssigneeError(false); // clear error when user selects an assignee
  };

  const handleCreate = () => {
    if (isOtherCategory && !newTicket.assigneeId) {
      // 🔴 trigger red border on Assignee
      setAssigneeError(true);
      return;
    }
    setAssigneeError(false);
    onCreate();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          width: 500,
          maxHeight: "90vh",
        },
      }}
    >
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
              value={displayCategory}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
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

          {/* Assignee – red border only when required & empty */}
          <FormControl
            size="small"
            fullWidth
            required={isOtherCategory}
            error={assigneeError} // 🔴 this enables red border/label
          >
            <InputLabel id="assignee-label">
              {loadingUsers
                ? "Loading users..."
                : isOtherCategory
                ? "Assignee *"
                : "Assignee (optional)"}
            </InputLabel>
            <Select
              labelId="assignee-label"
              label={
                loadingUsers
                  ? "Loading users..."
                  : isOtherCategory
                  ? "Assignee *"
                  : "Assignee (optional)"
              }
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

          {(currentUser?.role || "").toLowerCase() !== "user" && (
            <TextField
              label="Due Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTicket.dueDate}
              onChange={onFieldChange("dueDate")}
            />
          )}

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
        <Button onClick={onClose} sx={{ color: "#1e40af" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{ backgroundColor: "#1e40af" }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
