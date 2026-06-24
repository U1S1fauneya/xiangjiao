import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-3 pr-[300px]">
      <h1 className="text-[32px] font-black leading-tight tracking-[-0.01em] text-navy-950">{title}</h1>
      <p className="mt-1.5 text-base font-semibold text-slate-600">{subtitle}</p>
    </header>
  );
}

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass-card rounded-2xl ${className}`}>{children}</section>;
}

export function PanelTitle({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-[18px] font-black text-navy-950">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function RailCard({
  title,
  icon: Icon,
  children,
  tone = "blue"
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  tone?: "blue" | "green" | "orange" | "purple";
}) {
  const color = {
    blue: "text-growth-blue",
    green: "text-growth-green",
    orange: "text-growth-orange",
    purple: "text-growth-purple"
  }[tone];

  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center gap-2 text-[17px] font-black text-navy-950">
        <Icon className={`h-5 w-5 ${color}`} />
        {title}
      </div>
      {children}
    </Panel>
  );
}

export function RailLine({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "orange" | "blue" }) {
  const color = tone === "orange" ? "bg-orange-400" : tone === "blue" ? "bg-growth-blue" : "bg-growth-green";
  return (
    <div className="flex gap-2 text-xs leading-5 text-slate-600">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      <span>{children}</span>
    </div>
  );
}

export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-growth-green" />
      <span>{children}</span>
    </div>
  );
}

export function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black text-navy-950">{value}</span>
    </div>
  );
}

export function ActionButton({ children, primary = false }: { children: ReactNode; primary?: boolean }) {
  return (
    <button
      className={
        primary
          ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-growth-blue px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(21,91,215,0.18)]"
          : "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 text-sm font-black text-growth-blue"
      }
    >
      {children}
    </button>
  );
}

export function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600">
      {children}
    </button>
  );
}

export function Donut({
  value,
  label,
  tone = "blue",
  size = 140
}: {
  value: number;
  label: string;
  tone?: "blue" | "green" | "orange" | "purple";
  size?: number;
}) {
  const color = {
    blue: "#155bd7",
    green: "#10a884",
    orange: "#ff7a1a",
    purple: "#7c5cff"
  }[tone];
  const style = {
    width: size,
    height: size,
    background: `conic-gradient(${color} 0 ${value * 3.6}deg, #dbe7f7 ${value * 3.6}deg 360deg)`
  } satisfies CSSProperties;

  return (
    <div className="relative grid shrink-0 place-items-center rounded-full" style={style}>
      <div className="grid h-[70%] w-[70%] place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
        <div>
          <div className="text-[28px] font-black leading-none text-navy-950">{value}%</div>
          <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function Sparkline({ tone = "blue" }: { tone?: "blue" | "green" | "orange" }) {
  const stroke = tone === "green" ? "#10a884" : tone === "orange" ? "#ff7a1a" : "#155bd7";
  return (
    <svg viewBox="0 0 180 54" className="h-12 w-full" aria-hidden="true">
      <path d="M2 42 C18 28, 28 14, 44 26 S72 48, 92 27 S124 8, 143 24 S165 24, 178 8" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M2 42 C18 28, 28 14, 44 26 S72 48, 92 27 S124 8, 143 24 S165 24, 178 8 L178 54 L2 54 Z" fill={stroke} opacity="0.08" />
    </svg>
  );
}

export function ChevronAction({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 text-xs font-black text-growth-blue">
      {children}
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  );
}
