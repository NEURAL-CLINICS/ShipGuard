import type { Finding, Project } from "../models";

export type ScannerFinding = Omit<Finding, "id" | "scanId">;

export type ScannerAdapter = {
  id: string;
  name: string;
  run: (project: Project) => Promise<ScannerFinding[]>;
};

const sampleAdapter: ScannerAdapter = {
  id: "sample",
  name: "Baseline Checks",
  async run(project: Project) {
    return [
      {
        ruleId: "SG0001",
        severity: "medium",
        file: "README.md",
        line: 1,
        description: "Project should document security review steps before release.",
        remediation: "Add a release checklist section to README.",
        scannerSource: "sample"
      }
    ];
  }
};

const adapters: ScannerAdapter[] = [sampleAdapter];

export async function runScanners(project: Project) {
  const results: ScannerFinding[] = [];
  for (const adapter of adapters) {
    try {
      const findings = await adapter.run(project);
      results.push(...findings);
    } catch (error) {
      console.warn(`Scanner ${adapter.id} failed`, error);
    }
  }
  return results;
}

export function listAdapters() {
  return adapters.map((adapter) => ({ id: adapter.id, name: adapter.name }));
}
