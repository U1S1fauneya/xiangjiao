import type { LucideIcon } from "lucide-react";
import { KpiCard } from "./KpiCard";

export function StaticPlaceholderPage({
  title,
  subtitle,
  icon: Icon,
  children
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[42px] font-black tracking-[-0.01em] text-navy-950">{title}</h1>
        <p className="mt-2 text-lg font-semibold text-slate-600">{subtitle}</p>
      </header>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="全部线索" value="23,845" change="+18.7% ↗" icon={Icon} color="blue" />
        <KpiCard label="高价值客户" value="2,386" change="+12.5% ↗" icon={Icon} color="green" />
        <KpiCard label="跟进中商机" value="578" change="+8.6% ↗" icon={Icon} color="orange" />
        <KpiCard label="待转生产" value="126" change="-4.1% ↘" icon={Icon} color="purple" negative />
      </div>
      <section className="glass-card mt-5 rounded-2xl p-7">
        {children ?? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <div>
              <Icon className="mx-auto h-12 w-12 text-growth-blue" />
              <div className="mt-4 text-2xl font-black text-navy-950">当前 Demo 重点展示找线索模块</div>
              <p className="mt-2 text-base font-semibold text-slate-500">该页面为基础壳，后续版本可接入真实业务流程。</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
