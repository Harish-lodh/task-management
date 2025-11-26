// src/components/tickets/TicketColumn.jsx

import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import {
  PersonOutline,
  CalendarMonth,
  FlagOutlined,
  AttachFile,
  MoreHoriz,
  Add,
  CheckCircle,
} from "@mui/icons-material";

import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import { memo, useMemo } from "react";

const PRIORITY_COLORS = {
  urgent: "darkred",
  high: "red",
  medium: "orange",
  low: "text.disabled",
};

/* -----------------------------
   Task Card (memoized)
----------------------------- */
const TaskCard = memo(function TaskCard({
  task,
  columnId,
  onDragStart,
  onTaskClick,
  onOpenFlagMenu,
  onOpenDueDateDialog,
}) {
  return (
    <Paper
      key={task.id}
      variant="outlined"
      draggable
      onDragStart={(e) => onDragStart(e, columnId, task.id)}
      onClick={() => onTaskClick(task, columnId)}
      sx={{
        borderRadius: 1,
        px: 1.5,
        py: 1.25,
        bgcolor: "white",
        borderColor: "#e5e7eb",
        cursor: "pointer",
        transition: "0.2s ease",
        "&:hover": {
          boxShadow: 2,
          borderColor: "#d1d5db",
        },
      }}
    >
      {/* Title */}
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
        {task.title}
      </Typography>

      {/* Assignee + Due Date */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={0.5}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "text.secondary" }}>
          <PersonOutline sx={{ fontSize: 16 }} />
          <Typography variant="caption">
            {task.assigneeName || "Unassigned"}
          </Typography>
        </Stack>

        {task.dueDate && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "text.secondary" }}>
            <CalendarMonth sx={{ fontSize: 16 }} />
            <Typography variant="caption">{task.dueDate}</Typography>
          </Stack>
        )}
      </Box>

      {/* Priority + Attachments + Due Date Button */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, color: "text.disabled" }}>

        {/* Flag (priority) */}
        {columnId !== "completed" ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFlagMenu(e, task, columnId);
            }}
          >
            <FlagOutlined
              sx={{
                fontSize: 16,
                color: PRIORITY_COLORS[task.priority] || "text.disabled",
              }}
            />
          </IconButton>
        ) : (
          <FlagOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
        )}

        {/* Attachments */}
        <AttachFile sx={{ fontSize: 16 }} />

        {/* Due Date Edit */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDueDateDialog(columnId, task);
          }}
        >
          <CalendarMonth sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    </Paper>
  );
});

/* -----------------------------
   Main Column Component
----------------------------- */
export default function TicketColumn({
  column,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
  onOpenDueDateDialog,
  onOpenFlagMenu,
  onOpenNewTicket,
}) {
  const taskCount = column.tasks?.length || 0;

  // Memoize icon renderer
  const columnIcon = useMemo(() => {
    switch (column.id) {
      case "todo":
        return <DonutLargeRoundedIcon sx={{ fontSize: 18, color: "#6b7280" }} />;
      case "in-progress":
        return <RadioButtonCheckedIcon sx={{ fontSize: 18, color: "#2563eb" }} />;
      case "completed":
        return <CheckCircle sx={{ fontSize: 18, color: "#059669" }} />;
      default:
        return <DonutLargeRoundedIcon sx={{ fontSize: 18, color: "#6b7280" }} />;
    }
  }, [column.id]);

  const accentColor = column.badgeColor || column.countColor || "#1e293b";

  return (
    <Grid item xs={12} md={4} sx={{ minWidth: 320, maxWidth: 420 }}>
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: column.headerBg || "#ffffff",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {columnIcon}

            <Chip
              label={
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "white",
                    fontSize: "0.75rem",
                    letterSpacing: 0.5,
                  }}
                >
                  {column.title}
                </Typography>
              }
              sx={{
                backgroundColor: accentColor,
                borderRadius: "6px",
                height: 26,
                "& .MuiChip-label": {
                  px: 1.5,
                  py: 0.5,
                },
              }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: accentColor }}>
              {taskCount}
            </Typography>
          </Box>

          <IconButton size="small" aria-label="column menu">
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>

        {/* Tasks list */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 1.5,
            bgcolor: "#f8fafc",
          }}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, column.id)}
        >
          <Stack spacing={1.5}>
            {(column.tasks || []).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
                onDragStart={onDragStart}
                onTaskClick={onTaskClick}
                onOpenFlagMenu={onOpenFlagMenu}
                onOpenDueDateDialog={onOpenDueDateDialog}
              />
            ))}

            {/* Add New Task */}
            <Button
              startIcon={<Add sx={{ fontSize: 18 }} />}
              onClick={() => onOpenNewTicket(column.id)}
              sx={{
                borderRadius: 1,
                py: 1,
                px: 2,
                justifyContent: "flex-start",
                textTransform: "none",
                fontSize: 12,
                fontWeight: 500,
                color: accentColor,
                bgcolor: "white",
                border: "1px dashed",
                borderColor: accentColor,
                "&:hover": {
                  bgcolor: "#f9fafb",
                  borderColor: accentColor,
                },
              }}
            >
              Add Task
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Grid>
  );
}
