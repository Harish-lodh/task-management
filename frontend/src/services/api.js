// src/api/api.js  (adjust path as per your folder structure)
import axios from "axios";
import apiClient from "../services/apiClient";

// 🔹 Tickets
export const getTicketsBoard = () => {
  return apiClient.get("/tickets/board");
};

export const createTicket = (payload) => {
  return apiClient.post("/tickets/create-ticket", payload);
};

export const updateTicket = (id, payload) => {
  return apiClient.patch(`/tickets/${id}`, payload);
};

// 🔹 Users
export const getUsers = () => {
  return apiClient.get("/users");
};

export default {
  getTicketsBoard,
  createTicket,
  updateTicket,
  getUsers,
};
