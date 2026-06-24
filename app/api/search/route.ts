import { NextResponse } from "next/server";
import { mockLeads } from "@/data/mockLeads";
import { searchSerpApi } from "@/services/serpApi";
import { filterLeads } from "@/utils/filterLeads";
import type { SearchFilters } from "@/data/searchTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = (searchParams.get("keywords") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sources = (searchParams.get("sources") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const filters: SearchFilters = {
    keywords,
    region: searchParams.get("region") || "全部",
    type: searchParams.get("type") || "全部类型",
    industry: searchParams.get("industry") || "全部行业",
    minConfidence: Number(searchParams.get("minConfidence") || 0),
    sources
  };

  const apiKey = process.env.SERPAPI_KEY?.trim();
  let providerMessage = apiKey ? "SerpApi 已配置，但本次实时搜索未返回可用线索，已回退演示数据。" : "SerpApi 未配置，当前使用演示数据。";
  if (apiKey) {
    try {
      const serpApiResult = await searchSerpApi(filters, apiKey);
      if (serpApiResult.results.length > 0) {
        return NextResponse.json({
          ...serpApiResult,
          providerMessage: "已调用 SerpApi 实时搜索，并完成线索格式化。"
        });
      }
    } catch {
      providerMessage = "SerpApi 实时搜索失败，已自动回退演示数据。";
      // Keep the demo resilient: external search failures fall back to curated sample data.
    }
  }

  const results = filterLeads(mockLeads, filters).sort((a, b) => b.confidence - a.confidence);

  return NextResponse.json({
    provider: "mock",
    providerMessage,
    summary: {
      total: 1285,
      newLeads: 128,
      highMatchCustomers: Math.max(56, results.filter((lead) => lead.type === "客户" && lead.confidence >= 80).length),
      supplierCandidates: Math.max(34, results.filter((lead) => lead.type === "供应商").length),
      needsReview: Math.max(21, results.filter((lead) => lead.type === "待确认").length)
    },
    results
  });
}
