import { useParams } from 'react-router-dom';
import { ProjectHeader } from '../../components/ProjectHeader';

export function ProjectPage() {
  const { id = '' } = useParams();
  return <ProjectHeader projectId={id} />;
}
