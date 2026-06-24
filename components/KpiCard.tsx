import type { LucideIcon } from "lucide-react";

const colorMap = {
  blue: "from-blue-500 to-blue-700 shadow-blue-500/20",
  green: "from-emerald-400 to-teal-600 shadow-emerald-500/20",
  orange: "from-orange-400 to-orange-600 shadow-orange-500/20",
  purple: "from-violet-400 to-violet-700 shadow-violet-500/20"
};

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  color = "blue",
  negative = false
}: {
  label: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color?: keyof typeof colorMap;
  negative?: boolean;
}) {
  return (
    <div className="glass-card flex min-h-[112px] items-center gap-4 rounded-2xl px-5 py-4">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center bg-gradient-to-br ${colorMap[color]} text-white shadow-xl`}
        style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="whitespace-nowrap text-[14px] font-black text-navy-950">{label}</div>
        <div className="mt-1 text-[30px] font-black leading-none text-navy-950 tabular-nums">{value}</div>
        <div className="mt-2 text-xs font-semibold text-slate-500">
          较昨日{" "}
          <span className={negative ? "text-red-500" : "text-emerald-600"}>{change}</span>
        </div>
      </div>
    </div>
  );
}
