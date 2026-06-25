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

type OrganicResultWithQuery = SerpApiOrganicResult & {
  sourceQuery: string;
};

const SERPAPI_ENDPOINT = "https://serpapi.com/search";
const DEFAULT_KEYWORDS = ["EPM", "EVM", "EPDM", "rubber compound", "rubber seal"];
const MAX_SERPAPI_QUERIES = 4;
const MAX_RESULTS_PER_QUERY = 10;

const blockedHostPatterns = [
  /youtube\.com$/i,
  /youtu\.be$/i,
  /linkedin\.com$/i,
  /facebook\.com$/i,
  /instagram\.com$/i,
  /x\.com$/i,
  /twitter\.com$/i,
  /wikipedia\.org$/i,
  /patents\.google\.com$/i,
  /researchgate\.net$/i,
  /scribd\.com$/i,
  /slideshare\.net$/i,
  /pressreleasefinder\.com$/i,
  /rubbernews\.com$/i,
  /matweb\.com$/i,
  /metoree\.com$/i,
  /iqsdirectory\.com$/i,
  /ensun\.io$/i,
  /kokoquest\.com$/i,
  /speplasticsindustryresource\.com$/i,
  /inpart24\.com$/i
];

const genericTitlePatterns = [
  /^epdm\b/i,
  /^epm\b/i,
  /^evm\b/i,
  /^rubber\b/i,
  /^ethylene\b/i,
  /^vistalon/i,
  /^compounds?\s+epm/i,
  /^what.?s the difference/i,
  /^custom epdm\b/i,
  /^leading epdm\b/i,
  /^top \d+/i,
  /^\d+\s+epdm/i,
  /manufacturers?\s+in\s+\d{4}/i,
  /suppliers?\s*$/i,
  /directory/i
];

const knownCompanyNames: Record<string, string> = {
  "gasketeng.com": "Gasket Engineering",
  "customgasketmfg.com": "Custom Gasket Mfg",
  "timcorubber.com": "Timco Rubber",
  "automatedgasketcorp.com": "Automated Gasket Corp",
  "herchyrubber.com": "Herchy Rubber",
  "arlanxeo.com": "ARLANXEO",
  "hexpol.com": "HEXPOL Rubber Compounding",
  "alttran.com": "ALTTRAN",
  "shidarubber.com": "Shida Rubber",
  "gbgummi.com": "GB Gummi",
  "fuyoumaoyi.com": "Fuyou Maoyi",
  "sealsdirect.co.uk": "Seals Direct",
  "eneos-materials.com": "ENEOS Materials",
  "vanderbiltchemicals.com": "Vanderbilt Chemicals",
  "powerrubber.com": "Power Rubber",
  "elastotechgaskets.com": "Elastotech Gaskets",
  "kef-america.com": "KEF America",
  "dow.com": "Dow",
  "gallagherseals.com": "Gallagher Fluid Seals",
  "mnrubber.com": "Minnesota Rubber & Plastics",
  "espint.com": "ESP International",
  "www5.espint.com": "ESP International",
  "fournierrubber.com": "Fournier Rubber",
  "dergom.com": "Dergom",
  "aerorubber.com": "Aero Rubber"
};

const keywordAliases: Record<string, string[]> = {
  EPM: ["epm", "ethylene propylene rubber", "ethylene-propylene"],
  EVM: ["evm", "ethylene vinyl acetate rubber", "ethylene-vinyl acetate", "levamelt", "levapren"],
  EPDM: ["epdm", "ethylene propylene diene"],
  橡胶密封件: ["rubber seal", "rubber gasket", "seal", "gasket", "o-ring", "密封"],
  混炼胶: ["rubber compound", "compound", "compounding", "混炼", "胶料"],
  汽车橡胶件: ["automotive rubber", "automotive", "vehicle", "weatherstrip", "hose", "汽车"],
  线缆橡胶材料: ["cable compound", "wire", "cable", "hffr", "frnc", "线缆", "电缆"],
  "rubber compound": ["rubber compound", "compounding", "compound"],
  "rubber seal": ["rubber seal", "seal", "gasket", "o-ring"]
};

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
  const timeoutMs = Number(process.env.SERPAPI_TIMEOUT_MS || 16000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const queries = buildQueries(filters);
    const searchResults = await Promise.all(
      queries.map((query) =>
        fetchSerpApiQuery(query, filters, apiKey, controller.signal).catch(() => ({
          results: [],
          totalResults: 0
        }))
      )
    );
    const rawResults = searchResults.flatMap((result) => result.results);
    const totalResults = Math.max(...searchResults.map((result) => result.totalResults ?? 0), 0);
    const leads = mapOrganicResults(rawResults, filters);
    const filtered = filterLeads(leads, filters)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 40);

    return {
      provider: "serpapi",
      summary: createSummary(filtered, totalResults),
      results: filtered
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSerpApiQuery(
  query: string,
  filters: SearchFilters,
  apiKey: string,
  signal: AbortSignal
): Promise<{ results: OrganicResultWithQuery[]; totalResults?: number }> {
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: apiKey,
    output: "json",
    hl: "en",
    safe: "active",
    start: "0",
    num: String(MAX_RESULTS_PER_QUERY)
  });

  const gl = countryCodeByRegion[filters.region];
  if (gl) params.set("gl", gl);

  const response = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    throw new Error(`SerpApi request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResponse;
  if (data.error) {
    throw new Error(data.error);
  }

  return {
    totalResults: data.search_information?.total_results,
    results: (data.organic_results ?? []).map((result) => ({
      ...result,
      sourceQuery: query
    }))
  };
}

function buildQueries(filters: SearchFilters) {
  const keywordText = normalizeKeywordText(filters.keywords.length > 0 ? filters.keywords : DEFAULT_KEYWORDS);
  const industry = filters.industry === "全部行业" ? "" : filters.industry;
  const region = filters.region === "全部" ? "" : filters.region;
  const typeIntent = getTypeIntent(filters.type);
  const baseParts = [keywordText, industry, region].filter(Boolean).join(" ");
  const queries = [
    `${baseParts} ${typeIntent} contact quote`,
    `${baseParts} rubber compound manufacturer supplier contact`,
    `${baseParts} custom gasket seal hose manufacturer request quote`,
    `${baseParts} HFFR cable compound EVM EPDM supplier`
  ];

  return uniqueStrings(queries.map(cleanQuery).filter(Boolean)).slice(0, MAX_SERPAPI_QUERIES);
}

function normalizeKeywordText(keywords: string[]) {
  const expanded = keywords.flatMap((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return [];
    const aliases = keywordAliases[trimmed];
    return aliases ? [trimmed, ...aliases.slice(0, 2)] : [trimmed];
  });
  return uniqueStrings(expanded).slice(0, 10).join(" ");
}

function cleanQuery(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getTypeIntent(type: string) {
  if (type === "客户") return "buyer procurement manufacturer";
  if (type === "供应商") return "supplier factory exporter";
  if (type === "贸易商") return "distributor trading import export";
  return "manufacturer supplier distributor";
}

function mapOrganicResults(results: OrganicResultWithQuery[], filters: SearchFilters): Lead[] {
  const seenHosts = new Set<string>();

  return results.flatMap((result, index) => {
    const link = result.link;
    if (!link) return [];

    const host = getHost(link);
    if (!host || seenHosts.has(host)) return [];

    const title = result.title || host;
    const snippet = result.snippet || "";
    const combined = `${title} ${snippet} ${host}`;
    if (!isCommercialLeadCandidate(host, link, combined, filters)) return [];
    seenHosts.add(host);

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
            snippet: snippet || `SerpApi 命中查询：${result.sourceQuery}。建议打开页面核验公司主体和联系方式。`
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
  if (knownCompanyNames[host]) return knownCompanyNames[host];

  const cleanedTitle = title
    .replace(/\s[-|–—]\s.*$/, "")
    .replace(/\s*\|.*$/, "")
    .replace(/\s*官网.*$/, "")
    .trim()
    .slice(0, 42);

  if (!cleanedTitle || genericTitlePatterns.some((pattern) => pattern.test(cleanedTitle))) {
    return companyNameFromHost(host);
  }

  return cleanedTitle;
}

function companyNameFromHost(host: string) {
  const withoutSuffix = host
    .replace(/\.(com|cn|net|org|co|co\.uk|com\.cn|de|jp|kr|vn|in|nl|id|th|us)$/i, "")
    .replace(/[-_]/g, " ");

  return withoutSuffix
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 42) || host;
}

function getMatchedKeywords(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  const candidates = keywords.length > 0 ? keywords : DEFAULT_KEYWORDS;
  const hits = candidates.filter((keyword) => {
    const directHit = lower.includes(keyword.toLowerCase());
    const aliasHit = (keywordAliases[keyword] ?? []).some((alias) => lower.includes(alias.toLowerCase()));
    return directHit || aliasHit;
  });

  const discovered = DEFAULT_KEYWORDS.filter((keyword) => lower.includes(keyword.toLowerCase()));
  return uniqueStrings([...hits, ...discovered]).slice(0, 4);
}

function inferLeadType(text: string, requestedType: string): LeadType {
  if (requestedType === "客户" || requestedType === "供应商" || requestedType === "贸易商" || requestedType === "待确认") {
    return requestedType;
  }

  const lower = text.toLowerCase();
  if (/(arlanxeo|dow\.com|eneos-materials|vanderbiltchemicals|hexpol|herchyrubber|fuyoumaoyi)/i.test(lower)) return "供应商";
  if (/(directory|marketplace|yellow pages|thomasnet|made-in-china|alibaba|globalsources|b2b|dealer|trading|importer|exporter|wholesale|经销|贸易|代理)/i.test(lower)) return "贸易商";
  if (/(gasket|seal|o-ring|hose|weatherstrip|extrusion|molding|moulding|custom rubber parts|rubber products|automotive rubber|密封件|橡胶件|胶管)/i.test(lower)) return "客户";
  if (/(rubber compound|compounding|polymer|chemical|raw material|elastomer|epm|evm|epdm|hffr|frnc|混炼胶|原料|材料)/i.test(lower)) return "供应商";
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

  if (/(alibaba|made-in-china|globalsources|go4worldbusiness|exporthub|1688|b2b|thomasnet|yellowpages)/i.test(lower)) {
    channels.add("B2B 平台");
  } else {
    channels.add("企业官网");
  }

  if (/(directory|association|expo|trade show|展会|协会|目录)/i.test(lower)) channels.add("行业目录");
  if (/(tender|bid|procurement|招标|投标|采购公告)/i.test(lower)) channels.add("招投标");
  return Array.from(channels);
}

function isCommercialLeadCandidate(host: string, link: string, text: string, filters: SearchFilters) {
  const lower = text.toLowerCase();
  const lowerLink = link.toLowerCase();
  if (lowerLink.includes(".pdf")) return false;
  if (blockedHostPatterns.some((pattern) => pattern.test(host))) return false;
  if (/(wiki|patent|youtube|linkedin|facebook|instagram|press release|news article|research paper|datasheet only)/i.test(lower)) return false;
  if (/(top \d+|list of \d+|manufacturers? in 20\d{2}|supplier directory|companies directory)/i.test(lower)) return false;
  if (/(\/blog\/|\/article\/|\/resources?\/|\/tools-resources\/|\/design-guide\/|\/news\/|\/guide\/)/i.test(lowerLink) && !/(request|quote|contact|supplier|manufacturer|custom)/i.test(lower)) return false;
  if (!/(epdm|epm|evm|hffr|frnc|rubber|elastomer|gasket|seal|hose|compound|橡胶|密封|混炼|线缆)/i.test(lower)) return false;

  const wantsB2B = filters.sources.includes("B2B 平台");
  const isDirectory = /(directory|yellow pages|thomasnet|made-in-china|alibaba|globalsources|b2b|marketplace)/i.test(lower);
  const hasCompanySignal = /(manufacturer|supplier|factory|producer|compounder|request a quote|contact us|custom|molding|extrusion|gasket|seal|hose|公司|厂家|工厂|供应商)/i.test(lower);
  return hasCompanySignal && (!isDirectory || wantsB2B);
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
  let score = 50;
  score += Math.min(matchedKeywords.length * 5, 20);
  score += Math.max(0, 8 - position);
  if (sourceChannels.includes("企业官网")) score += 7;
  if (sourceChannels.includes("B2B 平台")) score -= 4;
  if (type !== "待确认") score += 4;
  if (/(request a quote|contact us|quote|inquiry)/i.test(text)) score += 7;
  if (/(custom|manufacturer|supplier|factory|producer|compounder)/i.test(text)) score += 5;
  if (/(epdm|epm|evm|hffr|frnc|rubber compound|gasket|seal|hose|elastomer|密封|橡胶|混炼)/i.test(text)) score += 6;
  if (/(blog|guide|resources|product technology|overview|what'?s the difference)/i.test(text)) score -= 6;
  if (/(directory|marketplace|yellow pages|thomasnet|made-in-china|alibaba|globalsources|blog|article|guide)/i.test(text)) score -= 10;
  return Math.max(55, Math.min(94, score));
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