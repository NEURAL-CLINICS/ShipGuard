import fs from "fs/promises";
import path from "path";

process.env.ALLOW_LOCAL_SOURCE = "true";
process.env.LOCAL_SOURCE_ROOT = path.resolve(__dirname, "../../../");

async function run() {
  const { buildMarkdownReport } = await import("../services/report");
  const { runScan } = await import("../services/scanRunner");
  const { findingStore, projectStore, scanStore, userStore } = await import("../storage");

  const rootPath = path.resolve(__dirname, "../../../");
  const user = await userStore.create("self@shipguard.local", "self");
  const project = await projectStore.create(
    user.id,
    "ShipGuard",
    `file://${rootPath}`,
    30,
    "core"
  );
  const scan = await scanStore.create(project.id, {
    sourceType: "local",
    sourceRef: rootPath
  });

  await runScan(scan.id);
  const updatedScan = await scanStore.findById(scan.id);
  const findings = await findingStore.listByScan(scan.id);

  const report = buildMarkdownReport(project, updatedScan ?? scan, findings);
  const detailLines = findings.map(
    (finding: { severity: string; ruleId: string; file: string; line: number; description: string }) =>
      `- [${finding.severity}] ${finding.ruleId} ${finding.file}:${finding.line} ${finding.description}`
  );

  const output = [
    report,
    "",
    "## Findings",
    detailLines.length > 0 ? detailLines.join("\n") : "- No findings detected."
  ].join("\n");

  const reportPath = path.resolve(__dirname, "../../../docs/self-security-report.md");
  await fs.writeFile(reportPath, output, "utf8");
  console.log("Self-security report written to docs/self-security-report.md");
}

run().catch((error) => {
  console.error("Self scan failed", error);
  process.exit(1);
});
