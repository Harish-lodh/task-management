import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
// ❌ remove: import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js"; // 👈 add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Ticket Backend API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
// ❌ remove: app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes); // 👈 add this line

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
