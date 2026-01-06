export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  file: string;
  line: number;
  description: string;
  remediation: string;
};

export type Project = {
  id: string;
  name: string;
  repoUrl: string;
  lastScan: string;
  lastScanStatus: "queued" | "running" | "completed" | "failed";
  riskLevel: "low" | "medium" | "high";
  findings: Finding[];
};

export const sampleProjects: Project[] = [
  {
    id: "p-1",
    name: "LaunchPad",
    repoUrl: "https://github.com/acme/launchpad",
    lastScan: "2025-01-12 10:24",
    lastScanStatus: "completed",
    riskLevel: "medium",
    findings: [
      {
        id: "f-1",
        severity: "high",
        category: "Secrets",
        title: "Hardcoded API token",
        file: "src/config.ts",
        line: 22,
        description: "API token is hardcoded in config.",
        remediation: "Move secrets to environment variables."
      },
      {
        id: "f-2",
        severity: "medium",
        category: "Dependencies",
        title: "Outdated crypto library",
        file: "package.json",
        line: 8,
        description: "Dependency has known issues in older versions.",
        remediation: "Upgrade to the latest patched version."
      }
    ]
  },
  {
    id: "p-2",
    name: "ShipLite",
    repoUrl: "https://github.com/acme/shiplite",
    lastScan: "2025-01-11 16:40",
    lastScanStatus: "completed",
    riskLevel: "high",
    findings: [
      {
        id: "f-3",
        severity: "critical",
        category: "Auth",
        title: "JWT secret defaulted",
        file: "src/auth.ts",
        line: 14,
        description: "JWT secret falls back to a default value.",
        remediation: "Require a strong secret via environment."
      },
      {
        id: "f-4",
        severity: "low",
        category: "Headers",
        title: "Missing HSTS header",
        file: "src/server.ts",
        line: 48,
        description: "Responses do not include HSTS.",
        remediation: "Enable HSTS for production."
      }
    ]
  }
];

export const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"];

export function getRiskLevel(findings: Finding[]) {
  if (findings.some((finding) => finding.severity === "critical")) {
    return "high";
  }
  if (findings.some((finding) => finding.severity === "high")) {
    return "medium";
  }
  return "low";
}
