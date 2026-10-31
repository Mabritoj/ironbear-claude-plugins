import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { useProjectStore } from '../../stores/projectStore';
import styles from './ProjectList.module.css';

export function ProjectList() {
  const projects = useProjectStore((s) => s.projects);
  const navigate = useNavigate();
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>PROJECTS</h1>
      <div className={styles.grid}>
        {projects.map((project) => (
          <Card key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className={styles.card}>
            <div className={styles.name}>{project.name}</div>
            <div className={styles.meta}>{project.openTasks} open tasks</div>
          </Card>
        ))}
      </div>
    </main>
  );
}
