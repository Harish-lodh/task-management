// src/components/tickets/TicketColumn.jsx
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import {
  PersonOutline,
  CalendarMonth,
  FlagOutlined,
  AttachFile,
  MoreHoriz,
  Add,
} from "@mui/icons-material";

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
  return (
    <Grid
      item
      xs={12}
      md={4}
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
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, column.id)}
        >
          <Stack spacing={1.5}>
            {column.tasks.map((task) => (
              <Paper
                key={task.id}
                variant="outlined"
                draggable
                onDragStart={(e) => onDragStart(e, column.id, task.id)}
                onClick={() => onTaskClick(task, column.id)}
                sx={{
                  borderRadius: 1,
                  px: 1.5,
                  py: 1.25,
                  bgcolor: "white",
                  borderColor: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, mb: 0.5 }}
                >
                  {task.title}
                </Typography>

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
                    {column.id !== "completed" ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFlagMenu(e, task, column.id);
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
                    ) : (
                      <FlagOutlined
                        sx={{ fontSize: 16, color: "text.disabled" }}
                      />
                    )}

                    <AttachFile sx={{ fontSize: 16 }} />

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDueDateDialog(column.id, task);
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

        <Button
          startIcon={<Add sx={{ fontSize: 18 }} />}
          onClick={onOpenNewTicket}
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
  );
}
