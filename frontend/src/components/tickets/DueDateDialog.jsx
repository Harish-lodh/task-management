// src/components/tickets/DueDateDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function DueDateDialog({
  open,
  value,
  onChange,
  onClose,
  onSave,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Set Due Date</DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 0 }}>
        <TextField
          label="Due Date"
          type="date"
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={value}
          onChange={onChange}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
