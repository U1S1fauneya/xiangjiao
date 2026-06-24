import { CalendarDays, CheckCircle2, ClipboardList, Download, Plus, Search, SquareStack, UsersRound } from "lucide-react";
import { ActionButton, ChevronAction, GhostButton, PageHeader, Panel, PanelTitle, RailCard, RailLine } from "@/components/DashboardPrimitives";
import { GradeBadge, LeadTypeBadge } from "@/components/LeadTypeBadge";
import { KpiCard } from "@/components/KpiCard";
import { mockLeads } from "@/data/mockLeads";

const owners = ["张伟", "李娜", "王磊", "陈晨", "赵敏"];
const dates = ["2026-06-05", "2026-06-06", "2026-06-07", "2026-06-08", "2026-06-09", "2026-06-10", "2026-06-11", "2026-06-12"];

export default function LeadsPage() {
  const rows = mockLeads.slice(0, 8);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4">
      <div className="min-w-0">
        <PageHeader title="线索池" subtitle="统一沉淀已确认线索，便于分级管理、协作跟进与持续筛选" />

        <section className="grid grid-cols-4 gap-3">
          <KpiCard label="已入池线索" value="2,486" change="+8.7% ↗" icon={UsersRound} color="blue" />
          <KpiCard label="A 类线索" value="612" change="占比 24.6%" icon={CheckCircle2} color="green" />
          <KpiCard label="待分配" value="328" change="占比 13.2%" icon={SquareStack} color="orange" negative />
          <KpiCard label="今日更新" value="68" change="+21.4% ↗" icon={CalendarDays} color="purple" />
        </section>

        <Panel className="mt-3 p-4">
          <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_120px] gap-3">
            <FilterInput label="公司名称" placeholder="请输入公司名称" />
            <FilterSelect label="国家/地区" value="全部" />
            <FilterSelect label="类型" value="全部类型" />
            <FilterSelect label="等级" value="全部等级" />
            <FilterSelect label="跟进状态" value="全部状态" />
            <div className="flex items-end gap-2">
              <GhostButton>重置</GhostButton>
              <ActionButton primary>搜索</ActionButton>
            </div>
          </div>
        </Panel>

        <Panel className="mt-3 p-4">
          <PanelTitle
            title="线索列表"
            subtitle="共 2,486 条"
            action={
              <div className="flex gap-2">
                <ActionButton primary><Plus className="h-4 w-4" />添加线索</ActionButton>
                <GhostButton><ClipboardList className="h-4 w-4" />批量分配</GhostButton>
                <GhostButton><Download className="h-4 w-4" />导出</GhostButton>
              </div>
            }
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="全选线索" /></th>
                  <th className="w-[230px] px-3 py-3">公司名称</th>
                  <th className="w-[82px] px-3 py-3">类型</th>
                  <th className="w-[78px] px-3 py-3">等级</th>
                  <th className="w-[106px] px-3 py-3">国家/地区</th>
                  <th className="w-[140px] px-3 py-3">相关产品</th>
                  <th className="w-[122px] px-3 py-3">最近动态</th>
                  <th className="w-[82px] px-3 py-3">负责人</th>
                  <th className="w-[132px] px-3 py-3">下一步行动</th>
                  <th className="w-16 px-3 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-blue-50/30">
                    <td className="px-4 py-3"><input type="checkbox" aria-label={`选择 ${lead.companyName}`} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-navy-950">{lead.companyName.slice(0, 1)}</div>
                        <div className="min-w-0">
                          <div className="truncate font-black text-navy-950">{lead.companyName}</div>
                          <div className="truncate text-xs font-semibold text-slate-500">{lead.website}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><LeadTypeBadge type={lead.type} /></td>
                    <td className="px-3 py-3"><GradeBadge grade={lead.grade} /></td>
                    <td className="px-3 py-3 font-bold text-slate-600">{lead.country}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {lead.matchedKeywords.slice(0, 2).map((keyword) => (
                          <span key={keyword} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{keyword}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-black text-navy-950">{index + 1} 天前</div>
                      <div className="truncate text-xs font-semibold text-slate-500">访问官网</div>
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-700">{owners[index % owners.length]}</td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-black text-growth-blue">{lead.nextAction.slice(0, 10)}</div>
                      <div className="text-xs font-semibold text-slate-500">{dates[index]}</div>
                    </td>
                    <td className="px-3 py-3 text-center text-xl font-black text-slate-400">···</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button key={page} className={`h-8 w-8 rounded-lg text-sm font-black ${page === 1 ? "bg-growth-blue text-white" : "bg-white text-slate-600 soft-border"}`}>
                {page}
              </button>
            ))}
            <span className="px-2 text-sm font-bold text-slate-500">...</span>
            <button className="h-8 w-10 rounded-lg bg-white text-sm font-black text-slate-600 soft-border">50</button>
            <span className="ml-3 text-sm font-bold text-slate-500">共 2,486 条</span>
          </div>
        </Panel>
      </div>

      <aside className="space-y-3 pt-[76px]">
        <RailCard title="线索分层策略" icon={SquareStack}>
          <div className="space-y-3">
            <Strategy label="A 级（高潜力）" text="有明确采购需求、预算充足，决策链清晰" tone="green" />
            <Strategy label="B 级（中潜力）" text="有需求但决策周期较长，需持续跟进" tone="blue" />
            <Strategy label="C 级（低潜力）" text="需求不明确或暂不具备采购条件" tone="orange" />
            <div className="border-t border-slate-100 pt-3"><ChevronAction>查看完整分层规则</ChevronAction></div>
          </div>
        </RailCard>

        <RailCard title="推荐下一步" icon={CheckCircle2} tone="green">
          <div className="space-y-2">
            {[
              ["本周建议跟进", "18 条线索"],
              ["即将到期任务", "7 条线索"],
              ["高潜力未触达", "9 条线索"]
            ].map(([label, count]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs">
                <span className="font-bold text-slate-600">{label}</span>
                <span className="font-black text-navy-950">{count}</span>
              </div>
            ))}
            <ChevronAction>进入跟进计划</ChevronAction>
          </div>
        </RailCard>

        <RailCard title="协作提醒" icon={ClipboardList} tone="blue">
          <div className="space-y-3">
            <RailLine tone="blue">@张伟 将线索 三洋化学（上海） 分配给您</RailLine>
            <RailLine tone="blue">@李娜 更新了线索 大陆密封技术（上海）</RailLine>
            <RailLine tone="blue">@王磊 完成了线索 GreenTyre Solutions</RailLine>
            <ChevronAction>查看全部提醒</ChevronAction>
          </div>
        </RailCard>
      </aside>
    </div>
  );
}

function FilterInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-navy-950">{label}</span>
      <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3">
        <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-600 outline-none" placeholder={placeholder} />
        <Search className="h-4 w-4 text-slate-400" />
      </div>
    </label>
  );
}

function FilterSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-navy-950">{label}</span>
      <select className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none" defaultValue={value}>
        <option>{value}</option>
      </select>
    </label>
  );
}

function Strategy({ label, text, tone }: { label: string; text: string; tone: "green" | "blue" | "orange" }) {
  const className = tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "blue" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700";
  return (
    <div className="rounded-xl bg-white p-3">
      <div className={`inline-flex rounded-lg px-2 py-1 text-xs font-black ${className}`}>{label}</div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}
