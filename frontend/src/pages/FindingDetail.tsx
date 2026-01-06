import { Link, useParams } from "react-router-dom";
import SeverityBadge from "../components/SeverityBadge";
import { sampleProjects } from "../lib/sampleData";

export default function FindingDetail() {
  const { projectId, findingId } = useParams();
  const project = sampleProjects.find((item) => item.id === projectId);
  const finding = project?.findings.find((item) => item.id === findingId);

  if (!project || !finding) {
    return (
      <section className="page">
        <div className="empty">Finding not found.</div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="section-header">
        <h2>{finding.title}</h2>
        <p>{project.name}</p>
      </div>
      <div className="finding-detail">
        <SeverityBadge severity={finding.severity} />
        <div className="detail-line">Category: {finding.category}</div>
        <div className="detail-line">
          Location: {finding.file}:{finding.line}
        </div>
        <div className="detail-block">
          <h4>Description</h4>
          <p>{finding.description}</p>
        </div>
        <div className="detail-block">
          <h4>Remediation</h4>
          <p>{finding.remediation}</p>
        </div>
        <Link className="button ghost" to={`/projects/${project.id}`}>
          Back to findings
        </Link>
      </div>
    </section>
  );
}
