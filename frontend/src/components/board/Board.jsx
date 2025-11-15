import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import apiClient from "../../services/apiClient"; // 👈 adjust path if needed

const emptyData = {
  todo: [],
  inProgress: [],
  complete: [],
};

export default function Board() {
  const [tasks, setTasks] = useState(emptyData);

  // ✅ Fetch tasks from backend on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await apiClient.get("/tickets/board");

        const grouped = {
          todo: [],
          inProgress: [],
          complete: [],
        };

        (data || []).forEach((t) => {
          let colKey = "todo";

          if (t.status === "todo") colKey = "todo";
          else if (t.status === "progress") colKey = "inProgress";
          else if (t.status === "completed") colKey = "complete";

          grouped[colKey].push({
            id: String(t.id), // draggableId must be string
            title: t.title,
            // you can store more fields if needed: description, assignee, etc.
            raw: t,
          });
        });

        setTasks(grouped);
      } catch (err) {
        console.error("Failed to load board tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  // Handle drag & drop (UI only for now)
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // If the same column
    if (source.droppableId === destination.droppableId) {
      const column = [...(tasks[source.droppableId] || [])];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);

      setTasks({ ...tasks, [source.droppableId]: column });
      return;
    }

    // Moving between columns
    const sourceCol = [...(tasks[source.droppableId] || [])];
    const destCol = [...(tasks[destination.droppableId] || [])];
    const [removed] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, removed);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    });

    // ⚠️ Optional: here later you can call PATCH /api/tickets/:id
    // to update status in backend based on destination.droppableId
  };

  const columns = [
    { key: "todo", title: "TO DO", color: "bg-gray-100" },
    { key: "inProgress", title: "IN PROGRESS", color: "bg-blue-100" },
    { key: "complete", title: "COMPLETE", color: "bg-green-100" },
  ];

  return (
    <div className="flex gap-6 p-6 overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map(({ key, title, color }) => (
          <Droppable droppableId={key} key={key}>
            {(provided) => (
              <div
                className="w-80 flex-shrink-0"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-700">{title}</h2>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {(tasks[key] || []).length}
                  </span>
                </div>

                {/* Column Body */}
                <div className={`p-3 rounded-lg ${color} min-h-[400px]`}>
                  {(tasks[key] || []).map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="bg-white p-3 rounded shadow mb-3 cursor-pointer"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className="font-medium">{task.title}</p>
                          <div className="flex gap-2 mt-2 text-gray-400 text-sm">
                            <span>📎</span>
                            <span>💬</span>
                            <span>📝</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add task button (opens your CreateTicket dialog) */}
                  <button className="mt-3 text-blue-600 text-sm">
                    + Add Task
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
}
