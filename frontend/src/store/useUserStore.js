import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: { name: 'Harish Lodh', initial: 'H' },
  projects: [
    { id: 1, name: 'Project 1', taskCount: 3 },
    { id: 2, name: 'Project 2', taskCount: 3 },
  ],
  currentProject: { id: 2, name: 'Project 2', taskCount: 3 },
  setCurrentProject: (project) => set({ currentProject: project }),
}));