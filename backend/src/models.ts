export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  repoUrl?: string;
  retentionDays: number;
  createdAt: string;
};

export type ScanStatus = "queued" | "running" | "completed" | "failed";

export type Scan = {
  id: string;
  projectId: string;
  status: ScanStatus;
  branch?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  findingsCount: number;
};

export type Finding = {
  id: string;
  scanId: string;
  ruleId: string;
  severity: Severity;
  file: string;
  line: number;
  description: string;
  remediation: string;
  scannerSource: string;
};
