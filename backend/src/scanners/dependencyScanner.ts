import fs from "fs/promises";
import path from "path";
import type { ScannerAdapter, ScannerFinding, ScanContext } from "./types";

function flagVersion(name: string, version: string): ScannerFinding | null {
  if (version.includes("*") || version.includes("latest")) {
    return {
      ruleId: "SG4001",
      severity: "medium",
      category: "Dependencies",
      file: "package.json",
      line: 1,
      description: `Dependency ${name} uses an unstable version specifier (${version}).`,
      remediation: "Pin to a stable semver range.",
      scannerSource: "dependency"
    };
  }
  if (version.startsWith("0.") || version.startsWith("^0.") || version.startsWith("~0.")) {
    return {
      ruleId: "SG4002",
      severity: "low",
      category: "Dependencies",
      file: "package.json",
      line: 1,
      description: `Dependency ${name} is pre-1.0 (${version}).`,
      remediation: "Review for stability and security advisories.",
      scannerSource: "dependency"
    };
  }
  if (version.startsWith("git+") || version.startsWith("http")) {
    return {
      ruleId: "SG4003",
      severity: "medium",
      category: "Dependencies",
      file: "package.json",
      line: 1,
      description: `Dependency ${name} is pulled from a URL (${version}).`,
      remediation: "Prefer registry releases to ensure auditability.",
      scannerSource: "dependency"
    };
  }
  return null;
}

export const dependencyScanner: ScannerAdapter = {
  id: "dependency",
  name: "Dependency Scanner",
  async run(context: ScanContext) {
    const pkgPath = path.join(context.rootPath, "package.json");
    try {
      const raw = await fs.readFile(pkgPath, "utf8");
      const pkg = JSON.parse(raw) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const findings: ScannerFinding[] = [];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const [name, version] of Object.entries(deps)) {
        const finding = flagVersion(name, version);
        if (finding) {
          findings.push(finding);
        }
      }
      return findings;
    } catch (error) {
      console.warn("Dependency scanner failed", error);
      return [];
    }
  }
};
