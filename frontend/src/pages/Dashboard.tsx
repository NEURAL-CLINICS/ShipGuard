import ProjectCard from "../components/ProjectCard";
import StatCard from "../components/StatCard";
import { sampleProjects, severityOrder } from "../lib/sampleData";
import type { Severity } from "../lib/sampleData";

export default function Dashboard() {
  const allFindings = sampleProjects.flatMap((project) => project.findings);
  const counts = severityOrder.reduce((acc, severity) => {
    acc[severity] = allFindings.filter((finding) => finding.severity === severity).length;
    return acc;
  }, {} as Record<Severity, number>);

  return (
    <section className="page">
      <div className="section-header">
        <h2>Release overview</h2>
        <p>Fast signal on what needs attention before shipping.</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Total findings" value={allFindings.length} />
        <StatCard label="Critical" value={counts.critical} tone="critical" />
        <StatCard label="High" value={counts.high} tone="high" />
        <StatCard label="Medium" value={counts.medium} tone="medium" />
        <StatCard label="Low" value={counts.low} tone="low" />
      </div>
      <div className="section-header">
        <h3>Projects</h3>
      </div>
      <div className="project-grid">
        {sampleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
