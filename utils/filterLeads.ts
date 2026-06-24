import type { Lead, SearchFilters } from "@/data/searchTypes";

export function filterLeads(leads: Lead[], filters: SearchFilters) {
  return leads.filter((lead) => {
    const keywordHit =
      filters.keywords.length === 0 ||
      filters.keywords.some((keyword) => {
        const k = keyword.toLowerCase();
        return (
          lead.companyName.toLowerCase().includes(k) ||
          lead.recommendation.toLowerCase().includes(k) ||
          lead.matchedKeywords.some((item) => item.toLowerCase().includes(k))
        );
      });

    const regionHit = filters.region === "全部" || lead.region === filters.region;
    const typeHit = filters.type === "全部类型" || lead.type === filters.type;
    const industryHit = filters.industry === "全部行业" || lead.industry === filters.industry;
    const confidenceHit = lead.confidence >= filters.minConfidence;
    const sourceHit =
      filters.sources.length === 0 ||
      lead.sourceChannels.some((source) => filters.sources.includes(source));

    return keywordHit && regionHit && typeHit && industryHit && confidenceHit && sourceHit;
  });
}

export function confidenceFromFilter(value: string) {
  if (value === "90%以上") return 90;
  if (value === "80%以上") return 80;
  if (value === "70%以上") return 70;
  if (value === "60%以上") return 60;
  return 0;
}
