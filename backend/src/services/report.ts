import { Finding, Project, Scan, Severity } from "../models";

const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"];

export function summarizeFindings(findings: Finding[]) {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };
  for (const finding of findings) {
    counts[finding.severity] += 1;
  }
  return counts;
}

export function buildMarkdownReport(project: Project, scan: Scan, findings: Finding[]) {
  const counts = summarizeFindings(findings);
  const lines = [
    "# ShipGuard Report",
    "",
    `Project: ${project.name}`,
    `Scan: ${scan.id}`,
    `Status: ${scan.status}`,
    "",
    "## Severity summary",
    ...severityOrder.map((severity) => `- ${severity}: ${counts[severity]}`)
  ];
  return lines.join("\n");
}
