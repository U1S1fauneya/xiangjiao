import { ClipboardList } from "lucide-react";
import { StaticPlaceholderPage } from "@/components/StaticPlaceholderPage";

export default function ProductionPage() {
  return (
    <StaticPlaceholderPage title="生产清单工作台" subtitle="商务确认后，把规格、数量、交期和质检要求整理成工厂可执行任务" icon={ClipboardList}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-500">
              <tr>
                <th className="px-4 py-3">任务</th>
                <th className="px-3 py-3">要求</th>
                <th className="px-3 py-3">数量</th>
                <th className="px-3 py-3">责任</th>
                <th className="px-3 py-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["原料准备", "EPDM / EVM 胶料确认", "三万件", "采购", "待确认"],
                ["图纸复核", "按客户图纸确认尺寸", "一套", "工程", "已收齐"],
                ["生产排期", "优先级中等，三日排产", "三天", "车间", "待排产"],
                ["质检要求", "尺寸、硬度、耐候测试", "全检", "质检", "待执行"],
                ["包装交付", "纸箱包装，按批次贴标", "三十箱", "仓储", "待执行"]
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => <td key={cell} className="px-4 py-4 font-bold text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-orange-50 p-5 text-orange-800">
          <h2 className="text-xl font-black">后续对接方向</h2>
          <p className="mt-3 leading-7">可对接 ERP / MES / 工厂排产系统，本 Demo 只展示结构化清单能力。</p>
        </div>
      </div>
    </StaticPlaceholderPage>
  );
}
