import TicketCard from "./TicketCard";

export default function Column({ title, items }) {
  return (
    <div className="w-80 bg-gray-100 p-3 rounded shadow">
      <h3 className="font-bold text-lg mb-3">{title}</h3>

      <div className="space-y-3">
        {items.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
