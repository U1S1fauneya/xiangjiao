"use client";

import { X, ExternalLink, ShieldAlert, Target, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Lead } from "@/data/searchTypes";
import { ConfidenceBar } from "./ConfidenceBar";
import { GradeBadge, LeadTypeBadge } from "./LeadTypeBadge";

export function LeadDetailDrawer({
  lead,
  onClose,
  onSave,
  saved
}: {
  lead: Lead | null;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  saved: boolean;
}) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-navy-950/24" aria-label="关闭详情" onClick={onClose} />
      <aside className="absolute bottom-0 right-0 top-0 w-[520px] overflow-y-auto bg-white p-7 shadow-[-24px_0_70px_rgba(6,31,67,0.2)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex gap-2">
              <LeadTypeBadge type={lead.type} />
              <GradeBadge grade={lead.grade} />
            </div>
            <h2 className="text-2xl font-black text-navy-950">{lead.companyName}</h2>
            <a className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-growth-blue" href={`https://${lead.website}`}>
              {lead.website}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Info label="国家/地区" value={lead.country} />
          <Info label="行业" value={lead.industry} />
          <Info label="来源渠道" value={lead.sourceChannels.join(" / ")} />
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 text-xs font-black text-slate-500">置信度</div>
            <ConfidenceBar value={lead.confidence} />
          </div>
        </div>

        <Section icon={Sparkles} title="AI 推荐理由">
          {lead.recommendation}
        </Section>
        <Section icon={ShieldAlert} title="风险提示">
          {lead.risk}
        </Section>
        <Section icon={Target} title="下一步建议">
          {lead.nextAction}
        </Section>

        <div className="mt-6">
          <div className="mb-3 text-sm font-black text-navy-950">命中关键词</div>
          <div className="flex flex-wrap gap-2">
            {lead.matchedKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-sm font-black text-navy-950">模拟网页证据片段</div>
          {lead.evidence.map((item) => (
            <div key={item.url} className="rounded-xl bg-white p-3 text-sm text-slate-600">
              <div className="font-black text-navy-950">{item.title}</div>
              <div className="mt-1 text-growth-blue">{item.url}</div>
              <p className="mt-2 leading-6">{item.snippet}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSave(lead)}
          disabled={saved}
          className="mt-7 h-12 w-full rounded-xl bg-growth-blue text-base font-black text-white shadow-[0_16px_28px_rgba(21,91,215,0.22)] disabled:bg-slate-300"
        >
          {saved ? "已加入线索池" : "加入线索池"}
        </button>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-black text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-black text-navy-950">{value}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-navy-950">
        <Icon className="h-4 w-4 text-growth-blue" />
        {title}
      </div>
      <p className="text-sm leading-7 text-slate-600">{children}</p>
    </section>
  );
}
