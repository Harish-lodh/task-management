import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import ticketMastersRouter from "./routes/ticketMasters.js";

import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import dashboardRoutes from "./routes/dashboard.js";

// ❌ remove: import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js"; // 👈 add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Ticket Backend API is running");
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/dashboard", dashboardRoutes);

// ❌ remove: app.use("/api/projects", projectRoutes);
app.use("/users", userRoutes); // 👈 add this line
app.use("/ticket-masters", ticketMastersRouter);
app.listen(PORT, () => {
  console.log(`✅ Server running on port:${PORT}`);
});
