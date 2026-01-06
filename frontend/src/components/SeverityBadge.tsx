import type { Severity } from "../lib/sampleData";

type SeverityBadgeProps = {
  severity: Severity;
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return <span className={`badge badge-${severity}`}>{severity}</span>;
}
