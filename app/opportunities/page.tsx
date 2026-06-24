import { BriefcaseBusiness } from "lucide-react";
import { StaticPlaceholderPage } from "@/components/StaticPlaceholderPage";

export default function OpportunitiesPage() {
  const cols = ["已回复", "报价中", "样品中", "商务确认"];
  return (
    <StaticPlaceholderPage title="商机跟进看板" subtitle="把邮件回复、报价、样品和商务确认放进一个可追踪流程" icon={BriefcaseBusiness}>
      <div className="grid grid-cols-4 gap-4">
        {cols.map((col, index) => (
          <div key={col} className="min-h-[380px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-navy-950">{col}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-growth-blue">{[18, 9, 5, 3][index]}</span>
            </div>
            {["华东密封件采购中心", "Rhein AutoSeal GmbH", "Daehan Cable Compound"].slice(0, index === 3 ? 1 : 2).map((item) => (
              <div key={item} className="mb-3 rounded-xl bg-white p-4 shadow-[0_10px_24px_rgba(26,42,73,0.08)]">
                <div className="font-black text-navy-950">{item}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">等待下一步业务确认，后续版本支持真实跟进记录。</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </StaticPlaceholderPage>
  );
}
