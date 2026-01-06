type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "critical" | "high" | "medium" | "low" | "neutral";
};

export default function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}
