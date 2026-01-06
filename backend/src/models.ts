export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type SourceType = "repo" | "upload" | "local";

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
  ruleSet: string;
  retentionDays: number;
  lastUploadPath?: string;
  lastUploadAt?: string;
  createdAt: string;
};

export type ScanStatus = "queued" | "running" | "completed" | "failed";

export type Scan = {
  id: string;
  projectId: string;
  status: ScanStatus;
  branch?: string;
  sourceType: SourceType;
  sourceRef: string;
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
  category: string;
  file: string;
  line: number;
  description: string;
  remediation: string;
  scannerSource: string;
};
