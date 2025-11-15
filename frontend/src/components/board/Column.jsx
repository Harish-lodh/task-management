import React from 'react';
import { Box } from '@mui/material';
import Column from './Column';

const Board = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const statuses = ['TO DO', 'IN PROGRESS', 'COMPLETE'];

  return (
    <Box className="flex gap-6 overflow-x-auto pb-4">
      {statuses.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </Box>
  );
};

export default Board;