import { Project } from "../models";
import { runScanners } from "../scanners";
import { findingStore, scanStore } from "../storage";

const now = () => new Date().toISOString();

export async function enqueueScan(project: Project, branch?: string) {
  const scan = scanStore.create(project.id, branch);
  scanStore.update(scan.id, { status: "running", startedAt: now() });

  try {
    const findings = await runScanners(project);
    findingStore.addMany(scan.id, findings);
    return scanStore.update(scan.id, {
      status: "completed",
      finishedAt: now(),
      findingsCount: findings.length
    });
  } catch (error) {
    scanStore.update(scan.id, { status: "failed", finishedAt: now() });
    throw error;
  }
}
