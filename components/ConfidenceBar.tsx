export function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-blue-500" : "bg-orange-500";

  return (
    <div className="min-w-[92px]">
      <div className="mb-1 text-sm font-black tabular-nums text-navy-950">{value}%</div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
