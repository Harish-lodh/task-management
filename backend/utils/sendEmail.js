import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send Ticket Notification Email
 */
export async function sendTicketEmail({
  to,
  cc,
  ticket,
  categoryName,
  subcategoryName,
  ownerName,
}) {
  if (!to) return;

  const subject = `[Ticket #${ticket.id}] ${ticket.title}`;

  const text = `
Hi ${ownerName || "Team"},

A new ticket has been created.

Category    : ${categoryName || "-"}
Subcategory : ${subcategoryName || "-"}
Title       : ${ticket.title}
Description : ${ticket.description || "-"}
Priority    : ${ticket.priority || "-"}
Status      : ${ticket.status || "-"}

Please login to incident.fintreefinance.com to take action.

Thanks,
Ticket System
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@yourdomain.com",
    to,
    cc: cc || undefined,
    subject,
    text,
  });
}
