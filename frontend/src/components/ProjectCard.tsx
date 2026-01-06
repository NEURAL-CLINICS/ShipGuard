import { Link } from "react-router-dom";
import type { Project } from "../lib/sampleData";
import { getRiskLevel } from "../lib/sampleData";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const riskLevel = getRiskLevel(project.findings);
  return (
    <Link className="project-card" to={`/projects/${project.id}`}>
      <div className="project-header">
        <div>
          <div className="project-name">{project.name}</div>
          <div className="project-repo">{project.repoUrl}</div>
        </div>
        <span className={`risk risk-${riskLevel}`}>{riskLevel}</span>
      </div>
      <div className="project-meta">
        Last scan: {project.lastScan} · {project.lastScanStatus}
      </div>
    </Link>
  );
}
