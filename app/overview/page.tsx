import { AlertCircle, BriefcaseBusiness, CheckSquare, Factory, PackageCheck, ShieldAlert, UserRound } from "lucide-react";
import { Donut, GhostButton, PageHeader, Panel, PanelTitle, RailCard, Sparkline } from "@/components/DashboardPrimitives";
import { KpiCard } from "@/components/KpiCard";

const funnel = [
  { label: "找线索", value: "23,845", rate: "32.6%", tone: "from-blue-500 to-blue-600" },
  { label: "线索池", value: "7,781", rate: "24.8%", tone: "from-blue-400 to-blue-500" },
  { label: "邮件开发", value: "1,933", rate: "29.3%", tone: "from-sky-400 to-cyan-500" },
  { label: "商机跟进", value: "567", rate: "22.2%", tone: "from-cyan-500 to-teal-500" },
  { label: "生产清单", value: "126", rate: "", tone: "from-teal-400 to-emerald-500" }
];

const tasks = [
  ["待跟进商机", "32", "去跟进"],
  ["待发送邮件", "68", "去处理"],
  ["待分配线索", "128", "去分配"],
  ["即将交期任务", "8", "去查看"],
  ["数据待清洗", "156", "去清洗"]
];

const activity = [
  ["三洋化学（上海）管理有限公司", "高价值客户", "浏览了 EPDM 解决方案页面", "10 分钟前"],
  ["PT. Sinar Karet Indonesia", "跟进中商机", "回复邮件：询价 EPDM 4045", "1 小时前"],
  ["青岛海力思斯橡胶制品有限公司", "高价值客户", "下载了产品规格书", "2 小时前"],
  ["Kumar Rubber Industries", "潜在客户", "首次访问网站（来自 Google）", "3 小时前"],
  ["越南橡胶贸贸易有限公司", "跟进中商机", "更新了需求：增加采购数量", "5 小时前"]
];

const sources = [
  ["Google 搜索", "9,845", "41.3%", "bg-blue-500"],
  ["行业平台", "6,324", "26.5%", "bg-blue-400"],
  ["社交媒体", "3,268", "13.7%", "bg-sky-300"],
  ["老客户介绍", "2,156", "9.0%", "bg-teal-500"],
  ["展会活动", "1,284", "5.4%", "bg-violet-400"],
  ["其他", "968", "4.1%", "bg-slate-300"]
];

export default function OverviewPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4">
      <div className="min-w-0">
        <PageHeader title="业务总览" subtitle="从搜索、筛选、开发到商机转生产，统一掌握增长与执行进度" />

        <section className="grid grid-cols-4 gap-3">
          <KpiCard label="全部线索" value="23,845" change="+18.7% ↗" icon={UserRound} color="blue" />
          <KpiCard label="高价值客户" value="2,386" change="+12.5% ↗" icon={BriefcaseBusiness} color="green" />
          <KpiCard label="跟进中商机" value="578" change="+8.6% ↗" icon={PackageCheck} color="orange" />
          <KpiCard label="待转生产" value="126" change="-4.1% ↘" icon={Factory} color="purple" negative />
        </section>

        <Panel className="mt-3 px-4 py-3">
          <PanelTitle title="增长转化漏斗" />
          <div className="flex items-center gap-3">
            {funnel.map((item, index) => (
              <div key={item.label} className="flex flex-1 items-center gap-2">
                <div className="w-full">
                  <div className="mb-1.5 text-center text-sm font-black text-navy-950">{item.label}</div>
                  <div
                    className={`grid h-[80px] place-items-center bg-gradient-to-br ${item.tone} px-2 text-center text-white shadow-[0_14px_24px_rgba(21,91,215,0.16)]`}
                    style={{ clipPath: "polygon(0 0, 100% 8%, 86% 100%, 14% 100%)" }}
                  >
                    <div>
                      <div className="text-[22px] font-black leading-none">{item.value}</div>
                      <div className="mt-1.5 text-xs font-bold opacity-90">较昨日 {index === 4 ? "-4.1%" : "+18.7%"}</div>
                    </div>
                  </div>
                </div>
                {item.rate ? <div className="mt-7 w-9 text-center text-sm font-black text-growth-blue">→<br />{item.rate}</div> : null}
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-2.5 text-center text-sm font-bold text-slate-600">
            <div>整体转化率 <span className="ml-2 text-growth-blue">0.53%</span></div>
            <div>平均销售周期 <span className="ml-2 text-growth-blue">28.6 天</span></div>
          </div>
        </Panel>

        <div className="mt-3 grid grid-cols-[0.85fr_1.65fr] gap-3">
          <Panel className="p-3.5">
            <PanelTitle title="今日重点任务" />
            <div className="space-y-2">
              {tasks.map(([name, count, action]) => (
                <div key={name} className="grid grid-cols-[1fr_52px_70px] items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <CheckSquare className="h-4 w-4 text-growth-blue" />
                    {name}
                  </div>
                  <div className="text-right font-black text-navy-950">{count}</div>
                  <GhostButton>{action}</GhostButton>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-3.5">
            <PanelTitle title="核心客户动态" action={<button className="text-xs font-black text-growth-blue">查看更多 ›</button>} />
            <div className="divide-y divide-slate-100">
              {activity.map(([name, tag, detail, time]) => (
                <div key={name} className="grid grid-cols-[1.15fr_92px_1.3fr_68px] items-center gap-3 py-1.5 text-xs">
                  <div className="truncate font-black text-navy-950">{name}</div>
                  <div className="rounded-full bg-emerald-50 px-2 py-1 text-center font-black text-emerald-700">{tag}</div>
                  <div className="truncate font-semibold text-slate-600">{detail}</div>
                  <div className="text-right font-semibold text-slate-400">{time}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <DistributionCard title="渠道来源分布" rows={sources} />
          <DistributionCard
            title="行业分布"
            rows={[
              ["汽车与交通", "6,542", "27.4%", "bg-blue-500"],
              ["工业制造", "5,126", "21.5%", "bg-blue-400"],
              ["建筑建材", "3,845", "16.1%", "bg-sky-300"],
              ["消费品", "3,287", "13.8%", "bg-teal-500"],
              ["能源电力", "2,156", "9.0%", "bg-violet-400"],
              ["其他", "2,889", "12.1%", "bg-slate-300"]
            ]}
          />
        </div>
      </div>

      <aside className="space-y-3 pt-[76px]">
        <Panel className="p-4">
          <PanelTitle title="本周业绩概览" action={<span className="text-xs font-bold text-slate-500">05.27 - 06.02</span>} />
          {[
            ["新增商机金额", "￥2,846,300", "+23.6%", "blue"],
            ["预计转化金额", "￥1,287,600", "+18.3%", "blue"],
            ["已转生产金额", "￥798,400", "+12.1%", "green"]
          ].map(([label, value, rate, tone]) => (
            <div key={label} className="border-b border-slate-100 py-3 last:border-b-0">
              <div className="text-xs font-bold text-slate-500">{label}</div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[22px] font-black text-navy-950">{value}</div>
                  <div className="mt-1 text-xs font-bold text-emerald-600">较上周 {rate}</div>
                </div>
                <div className="w-24">
                  <Sparkline tone={tone === "green" ? "green" : "blue"} />
                </div>
              </div>
            </div>
          ))}
        </Panel>

        <Panel className="p-4">
          <PanelTitle title="产能占用" />
          <div className="flex items-center gap-4">
            <Donut value={68} label="产能占用率" size={124} />
            <div className="flex-1 space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between"><span>已占用产能</span><span className="text-navy-950">1,360 吨</span></div>
              <div className="flex justify-between"><span>剩余可用产能</span><span className="text-navy-950">640 吨</span></div>
              <div className="flex justify-between"><span>总产能</span><span className="text-navy-950">2,000 吨</span></div>
              <div className="pt-2 text-right text-emerald-600">较昨日 +4.2% ◆</div>
            </div>
          </div>
        </Panel>

        <RailCard title="风险预警" icon={ShieldAlert} tone="orange">
          <div className="space-y-3">
            {[
              ["商机超期未跟进（≥7天）", "15"],
              ["高价值客户未触达", "23"],
              ["邮件高风险退信", "9"],
              ["即将交期生产任务", "8"]
            ].map(([label, count]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-600"><AlertCircle className="h-4 w-4 text-orange-500" />{label}</span>
                <span className="font-black text-red-500">{count}</span>
              </div>
            ))}
            <button className="mt-2 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-sm font-black text-navy-950">
              全部预警 <span className="text-red-500">55 项 ›</span>
            </button>
          </div>
        </RailCard>
      </aside>
    </div>
  );
}

function DistributionCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Panel className="p-3.5">
      <PanelTitle title={title} action={<GhostButton>本月</GhostButton>} />
      <div className="flex items-center gap-5">
        <Donut value={68} label="全部线索" size={124} />
        <div className="flex-1 space-y-2">
          {rows.map(([name, count, rate, color]) => (
            <div key={name} className="grid grid-cols-[12px_1fr_70px_52px] items-center gap-2 text-xs font-semibold text-slate-600">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              <span className="truncate">{name}</span>
              <span className="text-right tabular-nums">{count}</span>
              <span className="text-right tabular-nums">({rate})</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
