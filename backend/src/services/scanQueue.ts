import { config } from "../config";
import { Project, SourceType } from "../models";
import { getScanQueue } from "../queue";
import { runScan } from "./scanRunner";
import { scanStore } from "../storage";

type ScanOptions = {
  branch?: string;
  sourceType: SourceType;
  sourceRef: string;
};

export async function enqueueScan(project: Project, options: ScanOptions) {
  const scan = await scanStore.create(project.id, options);

  if (config.queueMode === "redis") {
    const queue = getScanQueue();
    if (!queue) {
      throw new Error("Scan queue unavailable");
    }
    await queue.add("scan", { scanId: scan.id });
    return scan;
  }

  await runScan(scan.id);
  return (await scanStore.findById(scan.id)) ?? scan;
}
