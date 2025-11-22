// src/components/tickets/PriorityPopover.jsx
import { Popover, Stack, Button } from "@mui/material";

export default function PriorityPopover({ flagMenu, onClose, onSelectPriority }) {
  const open = Boolean(flagMenu.anchorEl);
  const { anchorEl, task, columnId } = flagMenu;

  const handleClick = (priority) => {
    if (!task || !columnId) return;
    onSelectPriority(task, columnId, priority);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Stack sx={{ p: 1, minWidth: 140 }}>
        <Button
          onClick={() => handleClick("urgent")}
          sx={{ justifyContent: "flex-start", color: "darkred" }}
        >
          🚨 Urgent
        </Button>
        <Button
          onClick={() => handleClick("high")}
          sx={{ justifyContent: "flex-start", color: "red" }}
        >
          🔥 High
        </Button>
        <Button
          onClick={() => handleClick("medium")}
          sx={{ justifyContent: "flex-start", color: "orange" }}
        >
          ⭐ Medium
        </Button>
        <Button
          onClick={() => handleClick("low")}
          sx={{ justifyContent: "flex-start", color: "gray" }}
        >
          ▪ Low
        </Button>
      </Stack>
    </Popover>
  );
}
