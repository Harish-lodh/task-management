// src/components/tickets/TicketDetailsDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";

export default function TicketDetailsDialog({ open, ticketDetail, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
                      ? attachment.file_name ||
                        attachment.name ||
                        `Attachment ${index + 1}`
                      : attachment}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
