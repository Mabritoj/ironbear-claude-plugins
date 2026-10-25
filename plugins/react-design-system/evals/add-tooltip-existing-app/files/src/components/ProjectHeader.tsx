import { useProjectStore } from '../stores/projectStore';
import { IconButton } from './IconButton';
import { Logo } from './Logo';
import styles from './ProjectHeader.module.css';

export function ProjectHeader({ projectId }: { projectId: string }) {
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const toggleStar = useProjectStore((s) => s.toggleStar);
  if (!project) return null;
  return (
    <header className={styles.header}>
      <Logo />
      <h1 className={styles.title}>{project.name}</h1>
      <div className={styles.actions}>
        <IconButton icon={project.starred ? '★' : '☆'} onClick={() => toggleStar(project.id)} />
        <IconButton icon="⚙" label="Project settings" />
        <IconButton icon="⋯" />
      </div>
    </header>
  );
}
