import type { Project } from "../models";
import { dependencyScanner } from "./dependencyScanner";
import { patternScanner } from "./patternScanner";
import { resolveRuleSet } from "./rules";
import type { ScanContext, ScannerAdapter, ScannerFinding } from "./types";

const adapters: ScannerAdapter[] = [patternScanner, dependencyScanner];

export async function runScanners(input: { project: Project; rootPath: string }) {
  const ruleSet = resolveRuleSet(input.project.ruleSet);
  const context: ScanContext = {
    project: input.project,
    rootPath: input.rootPath,
    ruleSet
  };
  const results: ScannerFinding[] = [];
  for (const adapter of adapters) {
    try {
      const findings = await adapter.run(context);
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
