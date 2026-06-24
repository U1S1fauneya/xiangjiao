import type { Lead } from "@/data/searchTypes";

const columns = [
  "公司名称",
  "官网",
  "国家/地区",
  "类型",
  "等级",
  "行业",
  "命中关键词",
  "来源渠道",
  "推荐理由",
  "置信度",
  "风险提示",
  "下一步建议"
];

export function exportLeadsCsv(leads: Lead[]) {
  const rows = leads.map((lead) => [
    lead.companyName,
    lead.website,
    lead.country,
    lead.type,
    lead.grade,
    lead.industry,
    lead.matchedKeywords.join(" / "),
    lead.sourceChannels.join(" / "),
    lead.recommendation,
    `${lead.confidence}%`,
    lead.risk,
    lead.nextAction
  ]);

  const csv = [columns, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rubber_leads_demo.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
