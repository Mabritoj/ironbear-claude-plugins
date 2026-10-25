import { Route, Routes } from 'react-router-dom';
import { ProjectList } from './features/projects/ProjectList';
import { ProjectPage } from './features/projects/ProjectPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
    </Routes>
  );
}
