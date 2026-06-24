"use client";

import { AlertTriangle, Bot, CheckCircle2, Compass, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trendData } from "@/data/mockLeads";

export function AiInsightPanel({
  enabledSources,
  keywordCount
}: {
  enabledSources: number;
  keywordCount: number;
}) {
  return (
    <aside className="space-y-3 pt-[100px]">
      <Panel title="AI 智能洞察" icon={Bot} tone="blue">
        <CheckItem>命中关键词覆盖核心产品与应用场景</CheckItem>
        <CheckItem>企业官网及产品页面存在相关信息</CheckItem>
        <CheckItem>行业目录与 B2B 数据交叉验证</CheckItem>
        <CheckItem>业务区域与目标市场高度重合</CheckItem>
      </Panel>

      <Panel title="搜索策略" icon={SlidersHorizontal} tone="purple">
        <Metric label="关键词组合" value={`${keywordCount} 个关键词`} />
        <Metric label="启用数据源" value={`${enabledSources} 个渠道`} />
        <Metric label="覆盖范围" value="全球 > 120 个国家/地区" />
        <Metric label="时间范围" value="近 24 个月" />
      </Panel>

      <Panel title="风险提示" icon={AlertTriangle} tone="orange">
        <WarnItem>部分企业信息更新较旧，建议人工复核</WarnItem>
        <WarnItem>存在同名或相似公司，注意甄别主体</WarnItem>
        <WarnItem>部分供应商产能与资质需进一步确认</WarnItem>
        <WarnItem>邮箱与联系人不保证完整</WarnItem>
      </Panel>

      <Panel title="行业热度趋势" icon={Compass} tone="blue">
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-sm font-bold text-slate-500">热度指数</div>
            <div className="text-2xl font-black text-navy-950">78</div>
          </div>
          <div className="text-sm font-black text-emerald-600">+8.6%</div>
        </div>
        <div className="mt-2 h-[108px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#748098" }} />
              <YAxis hide domain={[30, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dbe5f0" }} />
              <Line type="monotone" dataKey="value" stroke="#155bd7" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </aside>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  tone
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  tone: "blue" | "purple" | "orange";
}) {
  const color = tone === "orange" ? "text-orange-500" : tone === "purple" ? "text-violet-600" : "text-growth-blue";
  return (
    <section className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-[16px] font-black text-navy-950">
        <Icon className={`h-[18px] w-[18px] ${color}`} />
        {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-xs leading-5 text-slate-600">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </div>
  );
}

function WarnItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-xs leading-5 text-slate-600">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
      <span>{children}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-xs">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black text-navy-950">{value}</span>
    </div>
  );
}
