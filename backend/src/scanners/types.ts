import type { Finding, Project } from "../models";
import type { RuleSet } from "./rules";

export type ScannerFinding = Omit<Finding, "id" | "scanId">;

export type ScanContext = {
  project: Project;
  rootPath: string;
  ruleSet: RuleSet;
};

export type ScannerAdapter = {
  id: string;
  name: string;
  run: (context: ScanContext) => Promise<ScannerFinding[]>;
};
