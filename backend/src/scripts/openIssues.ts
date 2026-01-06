import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type Finding = {
  severity: string;
  ruleId: string;
  file: string;
  line: string;
  description: string;
};

function parseFindings(lines: string[]): Finding[] {
  return lines
    .filter((line) => line.startsWith("- ["))
    .map((line) => {
      const match = line.match(/\[(.+?)\]\s+(\S+)\s+([^:]+):(\d+)\s+(.*)$/);
      if (!match) {
        return null;
      }
      return {
        severity: match[1],
        ruleId: match[2],
        file: match[3],
        line: match[4],
        description: match[5]
      };
    })
    .filter((finding): finding is Finding => Boolean(finding));
}

async function run() {
  const reportPath = path.resolve(__dirname, "../../../docs/self-security-report.md");
  const report = await fs.readFile(reportPath, "utf8");
  const findings = parseFindings(report.split("\n"));
  const actionable = findings.filter((finding) =>
    ["critical", "high"].includes(finding.severity.toLowerCase())
  );

  if (actionable.length === 0) {
    console.log("No critical or high findings to open issues for.");
    return;
  }

  for (const finding of actionable) {
    const title = `[Security] ${finding.severity.toUpperCase()} ${finding.ruleId}`;
    const body = [
      "Automated finding from ShipGuard self-scan.",
      "",
      `- Severity: ${finding.severity}`,
      `- Rule: ${finding.ruleId}`,
      `- Location: ${finding.file}:${finding.line}`,
      `- Description: ${finding.description}`
    ].join("\n");

    await execFileAsync("gh", [
      "issue",
      "create",
      "--title",
      title,
      "--body",
      body,
      "--label",
      "security"
    ]);
  }
}

run().catch((error) => {
  console.error("Failed to open issues", error);
  process.exit(1);
});
