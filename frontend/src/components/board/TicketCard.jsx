export default function TicketCard({ ticket }) {
  return (
    <div className="p-3 bg-white rounded shadow cursor-pointer hover:bg-gray-50">
      <h4 className="font-semibold">{ticket.title}</h4>
      <p className="text-sm text-gray-600">{ticket.description}</p>

      <div className="text-xs mt-2 text-gray-500">
        {ticket.start_date} → {ticket.end_date}
      </div>
    </div>
  );
}
