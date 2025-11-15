import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import Column from "./Column";

export default function Board() {
  const [tickets, setTickets] = useState([]);
  const [groups, setGroups] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await apiClient.get("/tickets/board/1");
    setTickets(data);

    const g = {};
    data.forEach((t) => {
      if (!g[t.status]) g[t.status] = [];
      g[t.status].push(t);
    });
    setGroups(g);
  };

  return (
    <div className="flex gap-6 p-4 overflow-x-auto">
      {Object.keys(groups).map((key) => (
        <Column key={key} title={key} items={groups[key]} />
      ))}
    </div>
  );
}
