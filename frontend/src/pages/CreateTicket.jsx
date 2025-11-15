import React, { useState } from 'react';
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
} from '@mui/material';

const CreateTicket = ({ open, onClose, onSave, defaultStatus }) => {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState(defaultStatus || 'TO DO');

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, assignee, status });
      setTitle('');
      setAssignee('');
      setStatus(defaultStatus || 'TO DO');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
        <TextField
          margin="dense"
          label="Assignee"
          fullWidth
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="mb-4"
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="TO DO">To Do</MenuItem>
            <MenuItem value="IN PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETE">Complete</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Create Task</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicket;