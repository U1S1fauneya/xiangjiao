import { Mail } from "lucide-react";
import { StaticPlaceholderPage } from "@/components/StaticPlaceholderPage";

export default function EmailPage() {
  return (
    <StaticPlaceholderPage title="邮件开发工作台" subtitle="基于线索信息生成高质量开发信与询价信，发送前由业务员人工确认" icon={Mail}>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr_280px]">
        <div className="rounded-2xl bg-slate-50 p-5">
          <h2 className="text-xl font-black text-navy-950">开发对象</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Info label="公司" value="三洋化学（上海）管理有限公司" />
            <Info label="类型" value="客户线索" />
            <Info label="产品" value="EPDM / 定制橡胶件" />
            <Info label="状态" value="草稿已生成，待确认发送" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-navy-950">静态开发信草稿</h2>
          <div className="mt-4 rounded-xl border border-slate-200 p-5 leading-8 text-slate-700">
            <p>尊敬的采购负责人，您好！</p>
            <p className="mt-3">我们专注于 EPM / EVM / EPDM 相关橡胶材料与标准化定制产品，可围绕密封件、汽车橡胶件、线缆橡胶材料等场景提供稳定交付。</p>
            <p className="mt-3">如果贵司近期有标准规格或定制需求，欢迎提供应用场景和基础参数，我们可以安排技术人员进行评估。</p>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="h-11 rounded-xl bg-growth-blue px-6 font-black text-white">确认发送</button>
            <button className="h-11 rounded-xl border border-blue-200 bg-white px-6 font-black text-growth-blue">重新生成</button>
          </div>
        </div>
        <div className="rounded-2xl bg-orange-50 p-5 text-sm leading-7 text-orange-800">
          后续版本可接入邮件服务、送达率监控、退信处理和回复跟踪。本 Demo 不会真实发送邮件。
        </div>
      </div>
    </StaticPlaceholderPage>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-black text-slate-500">{label}</div>
      <div className="mt-1 font-black text-navy-950">{value}</div>
    </div>
  );
}
