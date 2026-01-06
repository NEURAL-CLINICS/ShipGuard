import type { Severity } from "../models";

export type Rule = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  description: string;
  remediation: string;
  pattern: RegExp;
};

export type RuleSet = {
  id: string;
  name: string;
  rules: Rule[];
};

const coreRules: Rule[] = [
  {
    id: "SG1001",
    title: "Hardcoded secret",
    category: "Secrets",
    severity: "high",
    description: "Potential secret or token appears hardcoded.",
    remediation: "Move secrets to environment variables or a secret manager.",
    pattern: /(api[_-]?key|secret|token|password)\s*=\s*["'][A-Za-z0-9_\-]{8,}["']/i
  },
  {
    id: "SG1002",
    title: "Private key material",
    category: "Secrets",
    severity: "critical",
    description: "Private key material appears in the codebase.",
    remediation: "Remove the key and rotate affected credentials.",
    pattern: /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/
  },
  {
    id: "SG2001",
    title: "Dynamic code execution",
    category: "Injection",
    severity: "high",
    description: "Dynamic code execution can enable injection.",
    remediation: "Avoid eval and use safe parsing alternatives.",
    pattern: /\beval\s*\(/
  },
  {
    id: "SG2002",
    title: "Insecure randomness",
    category: "Crypto",
    severity: "medium",
    description: "Math.random is not suitable for security decisions.",
    remediation: "Use a cryptographically secure RNG.",
    pattern: /\bMath\.random\s*\(/
  },
  {
    id: "SG2003",
    title: "TLS verification disabled",
    category: "Transport",
    severity: "high",
    description: "TLS verification is disabled.",
    remediation: "Remove or gate for local development only.",
    pattern: /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0["']?/
  },
  {
    id: "SG3001",
    title: "Dangerous HTML injection",
    category: "XSS",
    severity: "medium",
    description: "dangerouslySetInnerHTML can lead to XSS.",
    remediation: "Sanitize HTML or avoid raw injection.",
    pattern: /\bdangerouslySetInnerHTML\b/
  },
  {
    id: "SG9001",
    title: "Security TODO",
    category: "Process",
    severity: "low",
    description: "Security TODO found in source.",
    remediation: "Resolve before release.",
    pattern: /TODO:\s*SECURITY/i
  }
];

const coreRuleSet: RuleSet = {
  id: "core",
  name: "Core OWASP-inspired",
  rules: coreRules
};

export const ruleSets: Record<string, RuleSet> = {
  core: coreRuleSet
};

export function resolveRuleSet(id?: string) {
  if (id && ruleSets[id]) {
    return ruleSets[id];
  }
  return coreRuleSet;
}
