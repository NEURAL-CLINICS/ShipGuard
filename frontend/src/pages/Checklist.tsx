import { Link, useParams } from "react-router-dom";
import StatCard from "../components/StatCard";
import { severityOrder } from "../lib/sampleData";
import type { Severity } from "../lib/sampleData";
import { useProjects } from "../lib/useProjects";

export default function Checklist() {
  const { projectId } = useParams();
  const { projects } = useProjects();
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <section className="page">
        <div className="empty">Project not found.</div>
      </section>
    );
  }

  const counts = severityOrder.reduce((acc, severity) => {
    acc[severity] = project.findings.filter((finding) => finding.severity === severity).length;
    return acc;
  }, {} as Record<Severity, number>);

  const decision =
    counts.critical > 0 ? "do-not-ship" : counts.high > 0 ? "hold" : "ship";

  const decisionLabel =
    decision === "do-not-ship"
      ? "Do not ship"
      : decision === "hold"
      ? "Hold for fixes"
      : "Proceed with caution";

  const decisionHint =
    decision === "do-not-ship"
      ? "Critical issues must be remediated."
      : decision === "hold"
      ? "Address high severity issues."
      : "Continue with standard validation.";

  return (
    <section className="page">
      <div className="section-header">
        <h2>Pre-release checklist</h2>
        <p>{project.name}</p>
      </div>
      <div className={`decision decision-${decision}`}>
        <div className="decision-label">{decisionLabel}</div>
        <p>{decisionHint}</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Critical" value={counts.critical} tone="critical" />
        <StatCard label="High" value={counts.high} tone="high" />
        <StatCard label="Medium" value={counts.medium} tone="medium" />
        <StatCard label="Low" value={counts.low} tone="low" />
      </div>
      <div className="checklist-actions">
        <Link className="button ghost" to={`/projects/${project.id}`}>
          Back to project
        </Link>
      </div>
    </section>
  );
}
