"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarSearch,
  Check,
  ChevronRight,
  Database,
  Download,
  Factory,
  FileSearch,
  Globe2,
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { AiInsightPanel } from "@/components/AiInsightPanel";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { KpiCard } from "@/components/KpiCard";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { LeadTypeBadge } from "@/components/LeadTypeBadge";
import { Toast } from "@/components/Toast";
import { sourceCards } from "@/data/mockLeads";
import type { Lead, SearchSummary } from "@/data/searchTypes";
import { confidenceFromFilter } from "@/utils/filterLeads";
import { exportLeadsCsv } from "@/utils/exportCsv";
import { getSavedLeads, saveLead } from "@/utils/localStorageLeads";

const initialKeywords = ["EPM", "EVM", "EPDM", "橡胶密封件", "混炼胶", "汽车橡胶件", "线缆橡胶材料"];
const regions = ["全部", "中国", "日本", "韩国", "泰国", "越南", "印度", "德国", "美国", "荷兰", "英国", "印度尼西亚"];
const types = ["全部类型", "客户", "供应商", "贸易商", "待确认"];
const industries = ["全部行业", "汽车与交通", "线缆材料", "工业制造", "建筑建材", "橡胶制品", "原料供应"];
const confidenceOptions = ["全部", "60%以上", "70%以上", "80%以上", "90%以上"];
const searchSteps = ["正在扩展关键词", "正在搜索多渠道数据", "正在解析企业官网", "正在清洗和去重", "正在进行 AI 评分", "搜索完成"];

type SearchResponse = {
  provider?: "mock" | "serpapi";
  providerMessage?: string;
  summary: SearchSummary;
  results: Lead[];
};

export default function SearchPage() {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [region, setRegion] = useState("全部");
  const [type, setType] = useState("全部类型");
  const [industry, setIndustry] = useState("全部行业");
  const [confidence, setConfidence] = useState("60%以上");
  const [enabledSources, setEnabledSources] = useState(sourceCards.map((source) => source.name));
  const [summary, setSummary] = useState<SearchSummary>({
    total: 1285,
    newLeads: 128,
    highMatchCustomers: 56,
    supplierCandidates: 34,
    needsReview: 21
  });
  const [provider, setProvider] = useState<"mock" | "serpapi">("mock");
  const [providerMessage, setProviderMessage] = useState("SerpApi 未配置，当前使用演示数据。");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);

  const pageSize = 5;
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => (sortDesc ? b.confidence - a.confidence : a.confidence - b.confidence));
  }, [results, sortDesc]);
  const totalPages = Math.max(1, Math.ceil(sortedResults.length / pageSize));
  const pagedResults = sortedResults.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setSavedIds(getSavedLeads().map((lead) => lead.id));
    void loadResults();
  }, []);

  async function loadResults(next?: Partial<{ region: string; type: string; industry: string; confidence: string; sources: string[]; keywords: string[] }>) {
    const q = {
      keywords: next?.keywords ?? keywords,
      region: next?.region ?? region,
      type: next?.type ?? type,
      industry: next?.industry ?? industry,
      confidence: next?.confidence ?? confidence,
      sources: next?.sources ?? enabledSources
    };
    const params = new URLSearchParams({
      keywords: q.keywords.join(","),
      region: q.region,
      type: q.type,
      industry: q.industry,
      minConfidence: String(confidenceFromFilter(q.confidence)),
      sources: q.sources.join(",")
    });
    const response = await fetch(`/api/search?${params.toString()}`);
    const data = (await response.json()) as SearchResponse;
    setProvider(data.provider ?? "mock");
    setProviderMessage(data.providerMessage ?? "");
    setSummary(data.summary);
    setResults(data.results);
    setPage(1);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function addKeyword() {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value)) return;
    const next = [...keywords, value];
    setKeywords(next);
    setKeywordInput("");
    void loadResults({ keywords: next });
  }

  function removeKeyword(keyword: string) {
    const next = keywords.filter((item) => item !== keyword);
    setKeywords(next);
    void loadResults({ keywords: next });
  }

  function clearKeywords() {
    setKeywords([]);
    void loadResults({ keywords: [] });
  }

  function toggleSource(source: string) {
    const next = enabledSources.includes(source)
      ? enabledSources.filter((item) => item !== source)
      : [...enabledSources, source];
    setEnabledSources(next);
    void loadResults({ sources: next });
  }

  function updateFilter(key: "region" | "type" | "industry" | "confidence", value: string) {
    if (key === "region") setRegion(value);
    if (key === "type") setType(value);
    if (key === "industry") setIndustry(value);
    if (key === "confidence") setConfidence(value);
    void loadResults({ [key]: value });
  }

  function handleSearch() {
    setLoading(true);
    setStepIndex(0);
    searchSteps.forEach((_, index) => {
      window.setTimeout(() => setStepIndex(index), index * 360);
    });
    window.setTimeout(async () => {
      await loadResults();
      setLoading(false);
      showToast("搜索完成，已完成 AI 初筛");
    }, 2300);
  }

  function handleSave(lead: Lead) {
    const result = saveLead(lead);
    setSavedIds(result.leads.map((item) => item.id));
    showToast(result.saved ? "已加入线索池" : "该线索已在线索池中");
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4">
      <Toast message={toast} />
      <div className="min-w-0">
        <header className="mb-4 pr-[300px]">
          <h1 className="text-[34px] font-black tracking-[-0.01em] text-navy-950">找线索工作台</h1>
          <p className="mt-1.5 text-base font-semibold text-slate-600">
            全渠道搜索 EPM / EVM / EPDM 相关客户与供应商，精准发现高价值线索
          </p>
        </header>

        <section className="grid grid-cols-4 gap-3">
          <KpiCard label="今日新增线索" value={summary.newLeads} change="+18.7% ↗" icon={UserRound} color="blue" />
          <KpiCard label="高匹配客户" value={summary.highMatchCustomers} change="+12.5% ↗" icon={UserCheck} color="green" />
          <KpiCard label="供应商候选" value={summary.supplierCandidates} change="+6.3% ↗" icon={UsersRound} color="orange" />
          <KpiCard label="待人工确认" value={summary.needsReview} change="-4.1% ↘" icon={Factory} color="purple" negative />
        </section>

        <section className="glass-card mt-3 rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[20px] font-black text-navy-950">
              <Sparkles className="h-5 w-5 text-growth-blue" />
              智能搜索
            </div>
            <div className="flex gap-2">
              <button onClick={clearKeywords} className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-600">
                清空
              </button>
              <button onClick={handleSearch} className="inline-flex h-9 items-center gap-2 rounded-xl bg-growth-blue px-4 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,91,215,0.22)]">
                <Search className="h-4 w-4" />
                搜索
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-sm font-black text-navy-950">关键词</div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <button key={keyword} onClick={() => removeKeyword(keyword)} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-black text-blue-700">
                  {keyword}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1">
                <input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && addKeyword()}
                  placeholder="添加关键词"
                  className="w-24 bg-transparent text-sm outline-none"
                />
                <button onClick={addKeyword} className="grid h-6 w-6 place-items-center rounded-full bg-slate-100">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
              <div className="mb-2.5 flex items-center justify-between text-sm font-black text-navy-950">
                <span>{searchSteps[stepIndex] ?? "正在准备搜索"}</span>
                <span>{Math.min(100, Math.round(((stepIndex + 1) / searchSteps.length) * 100))}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-growth-blue transition-all" style={{ width: `${Math.min(100, ((stepIndex + 1) / searchSteps.length) * 100)}%` }} />
              </div>
              <div className="mt-2.5 grid grid-cols-6 gap-2 text-[11px] font-bold text-slate-500">
                {searchSteps.map((step, index) => (
                  <span key={step} className={index <= stepIndex ? "text-growth-blue" : ""}>{step}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_148px] gap-3">
            <Select label="地区" value={region} options={regions} onChange={(value) => updateFilter("region", value)} />
            <Select label="类型" value={type} options={types} onChange={(value) => updateFilter("type", value)} />
            <Select label="行业" value={industry} options={industries} onChange={(value) => updateFilter("industry", value)} />
            <Select label="相关度" value={confidence} options={confidenceOptions} onChange={(value) => updateFilter("confidence", value)} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-black text-navy-950">更多</span>
              <button className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none">
                更多筛选
              </button>
            </label>
          </div>
        </section>

        <section className="glass-card mt-3 rounded-2xl px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2 text-base font-black text-navy-950">
            数据来源 <span className="text-sm font-bold text-slate-500">（多源融合，实时更新）</span>
            <span
              title={providerMessage}
              className={`ml-auto rounded-full px-3 py-1 text-xs font-black ${provider === "serpapi" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              {provider === "serpapi" ? "实时搜索已接通" : "演示数据"}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2.5">
            {sourceCards.map((source) => {
              const enabled = enabledSources.includes(source.name);
              const Icon = sourceIcon(source.name);
              return (
                <button
                  key={source.name}
                  onClick={() => toggleSource(source.name)}
                  className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${enabled ? "border-blue-100 bg-white shadow-[0_10px_22px_rgba(26,42,73,0.07)]" : "border-slate-200 bg-slate-50 opacity-60"}`}
                >
                  <Icon className={enabled ? "h-6 w-6 shrink-0 text-growth-blue" : "h-6 w-6 shrink-0 text-slate-400"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-navy-950">{source.name}</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-500 tabular-nums">{source.count.toLocaleString()}</div>
                  </div>
                  <ChevronRight className={enabled ? "h-4 w-4 shrink-0 text-slate-400" : "h-4 w-4 shrink-0 text-slate-300"} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-card mt-3 rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-base font-black text-navy-950">
              线索结果 <span className="text-sm font-bold text-slate-500">（共 {results.length} 条）</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportLeadsCsv(sortedResults)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                <Download className="h-4 w-4" />
                导出
              </button>
              <button onClick={() => setSortDesc(!sortDesc)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
                <SlidersHorizontal className="h-4 w-4" />
                置信度{sortDesc ? "↓" : "↑"}
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <FileSearch className="mx-auto h-11 w-11 text-slate-400" />
                <div className="mt-3 text-lg font-black text-navy-950">暂无匹配线索，请调整关键词或筛选条件</div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="whitespace-nowrap bg-slate-50 text-xs font-black text-slate-500">
                    <tr>
                      <th className="w-[220px] px-4 py-2.5">公司名称</th>
                      <th className="w-[70px] px-3 py-2.5">国家</th>
                      <th className="w-[76px] px-3 py-2.5">类型</th>
                      <th className="w-[148px] px-3 py-2.5">命中关键词</th>
                      <th className="px-3 py-2.5">推荐理由</th>
                      <th className="w-[104px] px-3 py-2.5">置信度</th>
                      <th className="w-[148px] px-3 py-2.5">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedResults.map((lead) => {
                      const saved = savedIds.includes(lead.id);
                      return (
                        <tr key={lead.id} className="hover:bg-blue-50/35">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-navy-950">
                                {lead.companyName.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-black text-navy-950">{lead.companyName}</div>
                                <div className="truncate text-xs font-semibold text-slate-500">{lead.website}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-600">{lead.country}</td>
                          <td className="px-3 py-2.5"><LeadTypeBadge type={lead.type} /></td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1.5">
                              {lead.matchedKeywords.slice(0, 3).map((item) => (
                                <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{item}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            <div className="line-clamp-2 leading-5">{lead.recommendation}</div>
                          </td>
                          <td className="px-3 py-2.5"><ConfidenceBar value={lead.confidence} /></td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1.5">
                              <button onClick={() => setSelectedLead(lead)} className="h-8 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-2.5 text-xs font-black text-growth-blue">
                                详情
                              </button>
                              <button
                                onClick={() => handleSave(lead)}
                                disabled={saved}
                                className="inline-flex h-8 min-w-[62px] items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-growth-blue px-2.5 text-xs font-black text-white disabled:bg-slate-300"
                              >
                                {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                {saved ? "已加入" : "加入池"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`h-8 w-8 rounded-lg text-sm font-black ${item === page ? "bg-growth-blue text-white" : "bg-white text-slate-600 soft-border"}`}
                  >
                    {item}
                  </button>
                ))}
                <span className="ml-3 text-sm font-bold text-slate-500">共 {sortedResults.length} 条</span>
              </div>
            </>
          )}
        </section>
      </div>

      <AiInsightPanel enabledSources={enabledSources.length} keywordCount={keywords.length} />
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSave={handleSave}
        saved={selectedLead ? savedIds.includes(selectedLead.id) : false}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-navy-950">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-growth-blue"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function sourceIcon(name: string) {
  if (name === "搜索引擎") return Globe2;
  if (name === "企业官网") return Building2;
  if (name === "B2B 平台") return Layers3;
  if (name === "行业目录") return Database;
  if (name === "展会协会") return UsersRound;
  return CalendarSearch;
}
