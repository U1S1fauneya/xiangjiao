import { createHash } from "node:crypto";
import type { Lead, LeadType, SearchFilters, SearchSummary } from "@/data/searchTypes";
import { filterLeads } from "@/utils/filterLeads";

type SerpApiOrganicResult = {
  position?: number;
  title?: string;
  link?: string;
  displayed_link?: string;
  snippet?: string;
  source?: string;
};

type SerpApiResponse = {
  error?: string;
  search_metadata?: {
    status?: string;
  };
  search_information?: {
    total_results?: number;
  };
  organic_results?: SerpApiOrganicResult[];
};

type SerpApiSearchResult = {
  provider: "serpapi";
  summary: SearchSummary;
  results: Lead[];
};

const SERPAPI_ENDPOINT = "https://serpapi.com/search";
const DEFAULT_KEYWORDS = ["EPM", "EVM", "EPDM", "rubber compound", "rubber seal"];

const countryCodeByRegion: Record<string, string> = {
  中国: "cn",
  日本: "jp",
  韩国: "kr",
  泰国: "th",
  越南: "vn",
  印度: "in",
  德国: "de",
  美国: "us",
  荷兰: "nl",
  英国: "uk",
  印度尼西亚: "id"
};

export async function searchSerpApi(filters: SearchFilters, apiKey: string): Promise<SerpApiSearchResult> {
  const timeoutMs = Number(process.env.SERPAPI_TIMEOUT_MS || 9000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const params = new URLSearchParams({
      engine: "google",
      q: buildQuery(filters),
      api_key: apiKey,
      output: "json",
      hl: "en",
      safe: "active",
      start: "0"
    });

    const gl = countryCodeByRegion[filters.region];
    if (gl) params.set("gl", gl);

    const response = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`SerpApi request failed with status ${response.status}`);
    }

    const data = (await response.json()) as SerpApiResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    const rawResults = data.organic_results ?? [];
    const leads = mapOrganicResults(rawResults, filters);
    const filtered = filterLeads(leads, filters).sort((a, b) => b.confidence - a.confidence);

    return {
      provider: "serpapi",
      summary: createSummary(filtered, data.search_information?.total_results),
      results: filtered
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildQuery(filters: SearchFilters) {
  const keywords = (filters.keywords.length > 0 ? filters.keywords : DEFAULT_KEYWORDS).slice(0, 5);
  const industry = filters.industry === "全部行业" ? "" : filters.industry;
  const region = filters.region === "全部" ? "" : filters.region;
  const typeIntent = getTypeIntent(filters.type);

  return [keywords.join(" "), industry, region, typeIntent, "rubber manufacturer supplier company"]
    .filter(Boolean)
    .join(" ");
}

function getTypeIntent(type: string) {
  if (type === "客户") return "buyer procurement manufacturer";
  if (type === "供应商") return "supplier factory exporter";
  if (type === "贸易商") return "distributor trading import export";
  return "manufacturer supplier distributor";
}

function mapOrganicResults(results: SerpApiOrganicResult[], filters: SearchFilters): Lead[] {
  const seenHosts = new Set<string>();

  return results.flatMap((result, index) => {
    const link = result.link;
    if (!link) return [];

    const host = getHost(link);
    if (!host || seenHosts.has(host)) return [];
    seenHosts.add(host);

    const title = result.title || host;
    const snippet = result.snippet || "";
    const combined = `${title} ${snippet} ${host}`;
    const matchedKeywords = getMatchedKeywords(combined, filters.keywords);
    const type = inferLeadType(combined, filters.type);
    const industry = inferIndustry(combined, filters.industry);
    const country = filters.region === "全部" ? inferCountry(host, combined) : filters.region;
    const sourceChannels = inferSourceChannels(host, combined);
    const confidence = scoreLead({
      text: combined,
      matchedKeywords,
      sourceChannels,
      position: result.position ?? index + 1,
      type
    });

    return [
      {
        id: `serp_${stableId(link)}`,
        companyName: cleanCompanyName(title, host),
        website: host,
        country,
        region: country,
        type,
        grade: confidence >= 82 ? "A" : confidence >= 70 ? "B" : "C",
        industry,
        matchedKeywords,
        sourceChannels,
        recommendation: buildRecommendation(type, industry, matchedKeywords, snippet),
        confidence,
        risk: buildRisk(type, sourceChannels),
        nextAction: type === "供应商" ? "发送采购询价，确认牌号、产能、交期和认证文件。" : "加入线索池，由业务员确认应用场景、采购量和联系人。",
        evidence: [
          {
            title,
            url: link,
            snippet: snippet || "SerpApi 返回的 Google 自然搜索结果，建议进入详情页人工复核。"
          }
        ]
      } satisfies Lead
    ];
  });
}

function stableId(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function getHost(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function cleanCompanyName(title: string, host: string) {
  return title
    .replace(/\s[-|–—]\s.*$/, "")
    .replace(/\s*\|.*$/, "")
    .replace(/\s*官网.*$/, "")
    .trim()
    .slice(0, 42) || host;
}

function getMatchedKeywords(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  const hits = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).slice(0, 4);
  return hits.length > 0 ? hits : DEFAULT_KEYWORDS.slice(0, 3);
}

function inferLeadType(text: string, requestedType: string): LeadType {
  if (requestedType === "客户" || requestedType === "供应商" || requestedType === "贸易商" || requestedType === "待确认") {
    return requestedType;
  }

  const lower = text.toLowerCase();
  if (/(distributor|trading|importer|exporter|dealer|贸易|经销|代理)/i.test(lower)) return "贸易商";
  if (/(supplier|manufacturer|factory|producer|compounder|供应商|厂家|工厂|制造)/i.test(lower)) return "供应商";
  if (/(buyer|procurement|purchasing|oem|automotive|cable|seal|采购|主机厂|客户)/i.test(lower)) return "客户";
  return "待确认";
}

function inferIndustry(text: string, requestedIndustry: string) {
  if (requestedIndustry !== "全部行业") return requestedIndustry;

  const lower = text.toLowerCase();
  if (/(cable|wire|hffr|frnc|线缆|电缆)/i.test(lower)) return "线缆材料";
  if (/(auto|vehicle|automotive|car|hose|汽车)/i.test(lower)) return "汽车与交通";
  if (/(compound|mixing|混炼|胶料)/i.test(lower)) return "橡胶制品";
  if (/(polymer|chemical|raw material|monomer|原料|化工)/i.test(lower)) return "原料供应";
  if (/(construction|building|建筑)/i.test(lower)) return "建筑建材";
  return "工业制造";
}

function inferCountry(host: string, text: string) {
  const lower = `${host} ${text}`.toLowerCase();
  if (host.endsWith(".cn") || /china|中国/.test(lower)) return "中国";
  if (host.endsWith(".jp") || /japan|日本/.test(lower)) return "日本";
  if (host.endsWith(".kr") || /korea|韩国/.test(lower)) return "韩国";
  if (host.endsWith(".th") || /thailand|泰国/.test(lower)) return "泰国";
  if (host.endsWith(".vn") || /vietnam|越南/.test(lower)) return "越南";
  if (host.endsWith(".in") || /india|印度/.test(lower)) return "印度";
  if (host.endsWith(".de") || /germany|德国/.test(lower)) return "德国";
  if (host.endsWith(".nl") || /netherlands|holland|荷兰/.test(lower)) return "荷兰";
  if (host.endsWith(".uk") || host.endsWith(".co.uk") || /united kingdom|英国/.test(lower)) return "英国";
  if (host.endsWith(".id") || /indonesia|印度尼西亚/.test(lower)) return "印度尼西亚";
  return "美国";
}

function inferSourceChannels(host: string, text: string) {
  const lower = `${host} ${text}`.toLowerCase();
  const channels = new Set<string>(["搜索引擎"]);

  if (/(alibaba|made-in-china|globalsources|go4worldbusiness|exporthub|1688|b2b)/i.test(lower)) {
    channels.add("B2B 平台");
  } else {
    channels.add("企业官网");
  }

  if (/(directory|association|expo|trade show|展会|协会|目录)/i.test(lower)) channels.add("行业目录");
  if (/(tender|bid|procurement|招标|投标|采购公告)/i.test(lower)) channels.add("招投标");
  return Array.from(channels);
}

function scoreLead({
  text,
  matchedKeywords,
  sourceChannels,
  position,
  type
}: {
  text: string;
  matchedKeywords: string[];
  sourceChannels: string[];
  position: number;
  type: LeadType;
}) {
  let score = 58;
  score += Math.min(matchedKeywords.length * 6, 18);
  score += Math.max(0, 12 - Math.floor(position / 2));
  if (sourceChannels.includes("企业官网")) score += 7;
  if (sourceChannels.includes("B2B 平台")) score += 4;
  if (type !== "待确认") score += 5;
  if (/(epdm|epm|evm|rubber|elastomer|密封|橡胶)/i.test(text)) score += 8;
  return Math.max(45, Math.min(93, score));
}

function buildRecommendation(type: LeadType, industry: string, matchedKeywords: string[], snippet: string) {
  const keywordText = matchedKeywords.slice(0, 3).join("、");
  const role = type === "供应商" ? "供应商候选" : type === "贸易商" ? "渠道/贸易商线索" : type === "客户" ? "潜在客户线索" : "待复核线索";
  const evidenceText = snippet ? `网页摘要显示：${snippet.slice(0, 58)}...` : "搜索结果与关键词存在匹配。";
  return `${role}，方向为${industry}，命中 ${keywordText}。${evidenceText}`;
}

function buildRisk(type: LeadType, sourceChannels: string[]) {
  if (type === "待确认") return "搜索摘要不足以判断主体类型，需要人工打开官网或 B2B 页面复核。";
  if (sourceChannels.includes("B2B 平台")) return "B2B 平台信息可能存在重复发布或贸易商冒充厂家，建议核验官网和资质。";
  return "当前仅基于搜索结果摘要判断，联系人、产能、认证和采购意向仍需业务员确认。";
}

function createSummary(results: Lead[], totalResults?: number): SearchSummary {
  return {
    total: Math.max(results.length, Math.min(totalResults ?? 0, 99999)),
    newLeads: results.length,
    highMatchCustomers: results.filter((lead) => lead.type === "客户" && lead.confidence >= 80).length,
    supplierCandidates: results.filter((lead) => lead.type === "供应商").length,
    needsReview: results.filter((lead) => lead.type === "待确认").length
  };
}
