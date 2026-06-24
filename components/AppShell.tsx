"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  Home,
  Mail,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SquareStack,
  UserCircle,
  CircleHelp
} from "lucide-react";

const navItems = [
  { href: "/overview", label: "总览", icon: Home },
  { href: "/search", label: "找线索", icon: Search },
  { href: "/leads", label: "线索池", icon: SquareStack },
  { href: "/email", label: "邮件开发", icon: Mail },
  { href: "/opportunities", label: "商机跟进", icon: BriefcaseBusiness },
  { href: "/production", label: "生产清单", icon: ClipboardList },
  { href: "/settings", label: "设置", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen grid-cols-[228px_1fr]">
      <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_28%_12%,rgba(65,155,255,0.2),transparent_27%),linear-gradient(180deg,#061f43_0%,#03142b_100%)] px-4 py-6 text-white shadow-sidebar">
        <div className="relative z-10 flex items-center gap-3 px-1">
          <LogoMark />
          <div className="min-w-0">
            <div className="whitespace-nowrap text-[20px] font-black leading-tight">橡胶增长中台</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100/80">
              Rubber Growth Platform
            </div>
          </div>
        </div>

        <nav className="relative z-10 mt-10 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (pathname === "/" && item.href === "/search");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-12 items-center gap-3 rounded-xl px-3.5 text-[16px] font-bold transition",
                  active
                    ? "bg-gradient-to-r from-growth-blue to-[#0d7666] text-white shadow-[0_16px_30px_rgba(0,0,0,0.22)]"
                    : "text-blue-50/86 hover:bg-white/8 hover:text-white"
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-28 left-4 right-4 rounded-2xl border border-white/10 bg-white/8 p-3">
          <div className="mb-2.5 flex items-center justify-between text-xs font-bold">
            <span>系统运行状态</span>
            <span className="flex items-center gap-2 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              正常
            </span>
          </div>
          {["全网搜索", "数据清洗", "邮件开发", "生产对接"].map((item) => (
            <div key={item} className="mt-2 flex items-center justify-between text-xs text-blue-50/82">
              <span>{item}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-3">
          <UserCircle className="h-10 w-10 text-blue-100" />
          <div>
            <div className="text-sm font-bold">演示账号</div>
            <div className="text-xs text-blue-100/72">管理员</div>
          </div>
        </div>
      </aside>

      <main className="relative min-w-0 px-10 py-6">
        <div className="absolute right-10 top-6 z-20 flex justify-end gap-2.5">
          <button className="inline-flex h-10 items-center gap-2 rounded-full bg-white/88 px-4 text-sm font-bold text-navy-950 shadow-soft soft-border">
            <CircleHelp className="h-4 w-4" />
            使用指南
          </button>
          <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white/88 shadow-soft soft-border">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-black text-white">
              12
            </span>
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white/88 shadow-soft soft-border">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="grid h-12 w-12 place-items-center">
      <svg viewBox="0 0 56 56" className="h-12 w-12 drop-shadow-[0_14px_24px_rgba(10,132,255,0.28)]" aria-hidden="true">
        <defs>
          <linearGradient id="rubber-logo-a" x1="7" y1="7" x2="48" y2="49" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="0.48" stopColor="#156dff" />
            <stop offset="1" stopColor="#062a66" />
          </linearGradient>
          <linearGradient id="rubber-logo-b" x1="12" y1="44" x2="44" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1fb6d9" />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <path d="M28 3 50 15.5v25L28 53 6 40.5v-25L28 3Z" fill="url(#rubber-logo-a)" />
        <path d="M28 10 43.5 18.8 28 27.8 12.5 18.8 28 10Z" fill="#6ee7ff" opacity="0.9" />
        <path d="M12.5 21.5 26 29.4v16.5L12.5 38V21.5Z" fill="url(#rubber-logo-b)" opacity="0.95" />
        <path d="M43.5 21.5 30 29.4v16.5L43.5 38V21.5Z" fill="#0b4cc2" opacity="0.95" />
      </svg>
    </div>
  );
}
