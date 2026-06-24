import { FileText, Globe2, Lightbulb, Mail, MessageCircle, Paperclip, Send, ShieldCheck } from "lucide-react";
import { ActionButton, CheckLine, PageHeader, Panel, PanelTitle, RailCard, RailLine } from "@/components/DashboardPrimitives";
import { KpiCard } from "@/components/KpiCard";

const draft = `尊敬的山田先生，
您好！

我是来自中国的橡胶解决方案供应商，专注于高性能橡胶密封件及定制工业橡胶件的研发与制造，产品广泛应用于汽车、工业设备、家电及流体控制等领域。

我们在 EPDM、NBR、FKM、硅橡胶 等材料方面具备丰富经验，可提供：
· 定制化设计与材料选型建议
· 稳定的批量生产与严格的品质管控（IATF 16949 体系）
· 具竞争力的交期与成本优势

看到贵司在密封与高分子材料领域的产品布局后，我们相信双方在相关产品上有很高的合作契机。

如您方便，期待与您进一步交流贵司的需求与应用场景，并提供合适的产品方案与报价。

此致
敬礼！

李明（Ming Li）
销售经理｜橡胶增长中台合作伙伴
邮箱：ming.li@rubbergrowth.com
电话：+86 138 0000 1234`;

export default function EmailPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
      <div className="min-w-0">
        <PageHeader title="邮件开发工作台" subtitle="基于线索信息生成高质量开发信与询价信，发送前由业务员人工确认" />

        <section className="grid grid-cols-4 gap-3">
          <KpiCard label="待开发线索" value="86" change="+12.3% ↗" icon={Mail} color="blue" />
          <KpiCard label="已生成草稿" value="42" change="+8.7% ↗" icon={FileText} color="green" />
          <KpiCard label="今日已发送" value="27" change="+3.6% ↗" icon={Send} color="orange" />
          <KpiCard label="收到回复" value="7" change="+40.0% ↗" icon={MessageCircle} color="purple" />
        </section>

        <div className="mt-3 grid grid-cols-[300px_minmax(0,1fr)] gap-4">
          <div className="space-y-3">
            <Panel className="p-4">
              <PanelTitle title="开发对象详情" />
              <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-growth-blue">
                  <Globe2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-navy-950">三洋化学（上海）管理有限公司</div>
                  <div className="text-xs font-semibold text-slate-500">sanyo-chem.com</div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">日本</span>
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">制造商</span>
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">EPDM</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <Info label="联系人" value="山田 健一（Kenichi Yamada）" />
                <Info label="职位" value="采购经理" />
                <Info label="邮箱" value="kenichi.yamada@sanyo-chem.com" />
                <Info label="电话" value="+81-3-1234-5678" />
                <Info label="地区" value="日本 · 东京" />
                <Info label="来源" value="Global Sources 2024" />
              </div>
            </Panel>

            <Panel className="p-4">
              <PanelTitle title="邮件节奏" subtitle="建议 3 步触达，提升回复率" />
              <div className="space-y-3">
                {[
                  ["1", "首次开发信（今天）", "草稿已生成"],
                  ["2", "三天后跟进", "计划 2026-06-09"],
                  ["3", "一周后提醒", "计划 2026-06-13"]
                ].map(([step, title, tag]) => (
                  <div key={step} className="grid grid-cols-[28px_1fr] gap-3">
                    <div className={`grid h-7 w-7 place-items-center rounded-full text-sm font-black ${step === "1" ? "bg-growth-blue text-white" : "border border-blue-200 bg-white text-growth-blue"}`}>{step}</div>
                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                      <div className="font-black text-navy-950">{title}</div>
                      <div className="mt-1 text-xs font-bold text-emerald-600">{tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="bg-blue-50/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-growth-blue">
                <Lightbulb className="h-4 w-4" />
                AI 建议
              </div>
              <p className="text-xs leading-5 text-slate-600">该联系人近期在官网发布了新产品信息，建议在邮件中提及以提高回复率。</p>
            </Panel>
          </div>

          <Panel className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-black text-navy-950">
                <span className="text-growth-blue">✦</span>
                AI 智能生成草稿
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                邮件类型
                <select className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">
                  <option>开发信</option>
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <Field label="收件人（To）" value="kenichi.yamada@sanyo-chem.com" suffix="抄送（Cc）　密送（Bcc）" />
              <Field label="主题（Subject）" value="高性能橡胶密封件与定制工业橡胶件合作建议" />
              <label className="block">
                <span className="mb-2 block text-sm font-black text-navy-950">邮件正文</span>
                <textarea
                  className="h-[402px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-navy-950 outline-none"
                  defaultValue={draft}
                />
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-3">
                <ActionButton primary>确认发送</ActionButton>
                <ActionButton>重新生成</ActionButton>
                <ActionButton>保存模板</ActionButton>
              </div>
              <ActionButton><Paperclip className="h-4 w-4" />预览效果</ActionButton>
            </div>
          </Panel>
        </div>
      </div>

      <aside className="space-y-3 pt-[76px]">
        <RailCard title="发送前检查" icon={ShieldCheck}>
          <div className="space-y-3">
            <CheckLine>收件人邮箱格式有效</CheckLine>
            <CheckLine>主题长度合适（14 字）</CheckLine>
            <CheckLine>正文字数适中（318 字）</CheckLine>
            <CheckLine>包含公司名与产品关键词</CheckLine>
            <CheckLine>包含明确的价值主张</CheckLine>
            <CheckLine>包含明确的下一步行动</CheckLine>
            <div className="flex items-center justify-end border-t border-slate-100 pt-3 text-sm font-black text-emerald-600">
              检查结果：通过
            </div>
          </div>
        </RailCard>

        <RailCard title="价值提示" icon={Lightbulb} tone="orange">
          <div className="space-y-3">
            <RailLine tone="blue">提及 EPDM 等材料，匹配客户关注点</RailLine>
            <RailLine tone="orange">突出 IATF 16949 认证，增强信任</RailLine>
            <RailLine tone="orange">强调定制化与交期，体现差异化优势</RailLine>
            <button className="w-full border-t border-slate-100 pt-3 text-sm font-black text-growth-blue">查看话术库建议 →</button>
          </div>
        </RailCard>

        <RailCard title="合规提醒" icon={ShieldCheck} tone="purple">
          <div className="space-y-3">
            <RailLine tone="blue">避免使用绝对化用语（如最优、第一等）</RailLine>
            <RailLine tone="blue">不涉及敏感信息与受限技术</RailLine>
            <RailLine tone="blue">符合反垃圾邮件法规（已添加退订指引）</RailLine>
            <button className="w-full border-t border-slate-100 pt-3 text-sm font-black text-growth-blue">查看合规规范 →</button>
          </div>
        </RailCard>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="truncate text-xs font-semibold text-navy-950">{value}</div>
    </div>
  );
}

function Field({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <label className="grid grid-cols-[104px_1fr] items-center gap-3">
      <span className="text-sm font-black text-navy-950">{label}</span>
      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <input className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-700 outline-none" defaultValue={value} />
        {suffix ? <div className="grid place-items-center border-l border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-500">{suffix}</div> : null}
      </div>
    </label>
  );
}
