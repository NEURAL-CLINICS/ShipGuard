import { runScanners } from "../scanners";
import { findingStore, projectStore, scanStore } from "../storage";
import { prepareScanSource } from "./sourceManager";

const now = () => new Date().toISOString();

export async function runScan(scanId: string) {
  const scan = await scanStore.findById(scanId);
  if (!scan) {
    throw new Error("Scan not found");
  }
  const project = await projectStore.findById(scan.projectId);
  if (!project) {
    throw new Error("Project not found for scan");
  }

  await scanStore.update(scan.id, { status: "running", startedAt: now() });
  const source = await prepareScanSource(scan, project);

  try {
    const findings = await runScanners({ project, rootPath: source.path });
    await findingStore.addMany(scan.id, findings);
    await scanStore.update(scan.id, {
      status: "completed",
      finishedAt: now(),
      findingsCount: findings.length
    });
  } catch (error) {
    await scanStore.update(scan.id, { status: "failed", finishedAt: now() });
    throw error;
  } finally {
    if (source.cleanup) {
      await source.cleanup();
    }
  }
}
