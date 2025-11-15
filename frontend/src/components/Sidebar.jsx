import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-5 space-y-4">
      <h2 className="text-xl font-bold">Ticket Manager</h2>

      <nav className="space-y-2">
        <Link to="/" className="block hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>

        <Link to="/tickets" className="block hover:bg-gray-700 p-2 rounded">
          Tickets
        </Link>

        <Link to="/create-ticket" className="block hover:bg-gray-700 p-2 rounded">
          Create Ticket
        </Link>
      </nav>
    </div>
  );
}
