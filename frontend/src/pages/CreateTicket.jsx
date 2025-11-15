import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import apiClient from "../services/apiClient";

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    priority: "Low",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    await apiClient.post("/tickets/create", form);
    alert("Ticket created!");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

          <div className="space-y-3 max-w-lg">
            <input
              name="title"
              onChange={handleChange}
              placeholder="Title"
              className="input border p-2 w-full"
            />

            <textarea
              name="description"
              onChange={handleChange}
              placeholder="Description"
              className="input border p-2 w-full h-28"
            />

            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              className="border p-2 w-full"
              onChange={handleChange}
            />

            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              className="border p-2 w-full"
              onChange={handleChange}
            />

            <select
              name="priority"
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <button onClick={submit} className="bg-blue-600 text-white py-2 px-4 rounded">
              Create Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
