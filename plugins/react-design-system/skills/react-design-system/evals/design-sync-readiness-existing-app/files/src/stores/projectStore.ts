import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  openTasks: number;
  starred: boolean;
}

interface ProjectState {
  projects: Project[];
  toggleStar: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [
    { id: 'web', name: 'Website relaunch', openTasks: 12, starred: true },
    { id: 'ios', name: 'iOS app', openTasks: 4, starred: false },
  ],
  toggleStar: (id) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
    })),
}));
