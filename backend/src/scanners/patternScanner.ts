import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import type { Rule } from "./rules";
import type { ScannerAdapter, ScannerFinding, ScanContext } from "./types";

const fileGlobs = [
  "**/*.{ts,tsx,js,jsx,py,go,rb,php,java,cs,kt,swift,rs,env,tf,yml,yaml,json,sh}"
];

const ignoreGlobs = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.data/**",
  "**/vendor/**"
];

const MAX_FILE_BYTES = 200_000;

function createFinding(
  rule: Rule,
  file: string,
  line: number
): ScannerFinding {
  return {
    ruleId: rule.id,
    severity: rule.severity,
    category: rule.category,
    file,
    line,
    description: rule.description,
    remediation: rule.remediation,
    scannerSource: "pattern"
  };
}

async function scanFile(
  filePath: string,
  rootPath: string,
  rules: Rule[]
): Promise<ScannerFinding[]> {
  const stats = await fs.stat(filePath);
  if (stats.size > MAX_FILE_BYTES) {
    return [];
  }
  const content = await fs.readFile(filePath, "utf8");
  if (content.includes("\u0000")) {
    return [];
  }
  const relative = path.relative(rootPath, filePath);
  const lines = content.split(/\r?\n/);
  const findings: ScannerFinding[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const lineText = lines[i];
    for (const rule of rules) {
      if (rule.pattern.test(lineText)) {
        findings.push(createFinding(rule, relative, i + 1));
      }
    }
  }

  return findings;
}

export const patternScanner: ScannerAdapter = {
  id: "pattern",
  name: "Pattern Scanner",
  async run(context: ScanContext) {
    const files = await fg(fileGlobs, {
      cwd: context.rootPath,
      ignore: ignoreGlobs,
      onlyFiles: true,
      dot: false,
      absolute: true
    });
    const findings: ScannerFinding[] = [];
    for (const filePath of files) {
      const matches = await scanFile(filePath, context.rootPath, context.ruleSet.rules);
      findings.push(...matches);
    }
    return findings;
  }
};
