import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeverityBadge from "../components/SeverityBadge";
import { sampleProjects, severityOrder } from "../lib/sampleData";
import type { Severity } from "../lib/sampleData";

const severityOptions: (Severity | "all")[] = ["all", ...severityOrder];
const sortOptions = ["severity", "file", "title"] as const;

export default function ProjectDetail() {
  const { projectId } = useParams();
  const project = sampleProjects.find((item) => item.id === projectId);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("severity");
  const findings = project?.findings ?? [];

  const filtered = useMemo(() => {
    let next = findings;
    if (severity !== "all") {
      next = next.filter((finding) => finding.severity === severity);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      next = next.filter((finding) =>
        [finding.title, finding.description, finding.file].some((value) =>
          value.toLowerCase().includes(q)
        )
      );
    }
    const sorted = [...next];
    if (sortBy === "severity") {
      sorted.sort(
        (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      );
    } else if (sortBy === "file") {
      sorted.sort((a, b) => a.file.localeCompare(b.file));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [findings, query, severity, sortBy]);

  if (!project) {
    return (
      <section className="page">
        <div className="empty">Project not found.</div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="section-header">
        <h2>{project.name}</h2>
        <p>{project.repoUrl}</p>
      </div>
      <div className="action-row">
        <button className="button" type="button">
          Connect repo
        </button>
        <button className="button" type="button">
          Upload archive
        </button>
        <button className="button primary" type="button">
          Run scan
        </button>
        <Link className="button ghost" to={`/projects/${project.id}/checklist`}>
          Checklist
        </Link>
      </div>
      <div className="filters">
        <input
          className="search"
          placeholder="Search by file, title, or description"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity | "all")}
        >
          {severityOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "all severities" : option}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as (typeof sortOptions)[number])
          }
        >
          <option value="severity">sort by severity</option>
          <option value="file">sort by file</option>
          <option value="title">sort by title</option>
        </select>
      </div>
      <div className="table-card">
        <div className="table-header">Findings</div>
        {filtered.length === 0 ? (
          <div className="empty">No findings match your filters.</div>
        ) : (
          <table className="finding-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((finding) => (
                <tr key={finding.id}>
                  <td>
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td>
                    <Link className="link" to={`/projects/${project.id}/findings/${finding.id}`}>
                      {finding.title}
                    </Link>
                  </td>
                  <td>{finding.category}</td>
                  <td>
                    {finding.file}:{finding.line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
