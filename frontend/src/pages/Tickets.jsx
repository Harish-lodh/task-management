import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Board from "../components/board/Board";
import apiClient from "../services/apiClient";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const { data } = await apiClient.get("/tickets");
    setTickets(data);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">Tickets</h2>

            <Link
              to="/create-ticket"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Create Ticket
            </Link>
          </div>

          {/* 🔥 Kanban Board */}
          <Board />

          {/* 🔥 Table View (Optional Preview) */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">All Tickets</h3>

            <table className="w-full border text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Priority</th>
                  <th className="p-2 border">Start</th>
                  <th className="p-2 border">End</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border">
                    <td className="p-2 border">{t.id}</td>
                    <td className="p-2 border">{t.title}</td>
                    <td className="p-2 border">{t.status}</td>
                    <td className="p-2 border">{t.priority}</td>
                    <td className="p-2 border">{t.start_date}</td>
                    <td className="p-2 border">{t.end_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
