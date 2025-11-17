// import React, { useState } from 'react';
// import { Box, Typography, Button } from '@mui/material';
// import {
//   Add as AddIcon,
//   ViewKanban as BoardIcon,
//   TableChart as TableIcon,
// } from '@mui/icons-material';
// import Board from '../components/board/Board';
// import CreateTicket from '../components/board/CreateTicket';
// import { useUserStore } from '../store/useUserStore';

// const Dashboard = () => {
//   const { currentProject } = useUserStore();
//   const [tasks, setTasks] = useState([
//     { id: 1, title: 'Task 1', status: 'IN PROGRESS', assignee: 'Harish' },
//     { id: 2, title: 'Task 2', status: 'TO DO', assignee: 'John' },
//     { id: 3, title: 'Task 3', status: 'TO DO', assignee: 'Sarah' },
//   ]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [defaultStatus, setDefaultStatus] = useState('TO DO');
//   const [view, setView] = useState('board');

//   const handleAddTask = (status) => {
//     setDefaultStatus(status);
//     setDialogOpen(true);
//   };

//   const handleSaveTask = (taskData) => {
//     const newTask = {
//       id: Date.now(),
//       ...taskData,
//     };
//     setTasks([...tasks, newTask]);
//   };

//   const handleUpdateTask = (taskId, updates) => {
//     setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)));
//   };

//   const handleDeleteTask = (taskId) => {
//     setTasks(tasks.filter((task) => task.id !== taskId));
//   };

//   return (
//     <Box className="p-6">
//       <Box className="flex items-center justify-between mb-6">
//         <Box>
//           <Typography variant="h5" className="font-semibold mb-1">
//             {currentProject.name}
//           </Typography>
//           <Typography variant="body2" className="text-gray-500">
//             Team Space / Projects / {currentProject.name}
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => handleAddTask('TO DO')}
//           className="normal-case bg-indigo-500 hover:bg-indigo-600"
//         >
//           Add Task
//         </Button>
//       </Box>

//       <Box className="flex gap-4 mb-6 border-b border-gray-200">
//         <Button
//           startIcon={<BoardIcon />}
//           onClick={() => setView('board')}
//           className={`normal-case ${view === 'board' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500'} rounded-none`}
//         >
//           Board
//         </Button>
//         <Button
//           startIcon={<TableIcon />}
//           onClick={() => setView('list')}
//           className={`normal-case ${view === 'list' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500'} rounded-none`}
//         >
//           List
//         </Button>

//       </Box>

//       <Board
//         tasks={tasks}
//         onAddTask={handleAddTask}
//         onUpdateTask={handleUpdateTask}
//         onDeleteTask={handleDeleteTask}
//       />

//       {/* <CreateTicket
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         onSave={handleSaveTask}
//         defaultStatus={defaultStatus}
//       /> */}
//     </Box>
//   );
// };

// export default Dashboard;