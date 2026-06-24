export type LeadType = "客户" | "供应商" | "贸易商" | "待确认";
export type LeadGrade = "A" | "B" | "C";

export type EvidenceItem = {
  title: string;
  url: string;
  snippet: string;
};

export type Lead = {
  id: string;
  companyName: string;
  website: string;
  country: string;
  region: string;
  type: LeadType;
  grade: LeadGrade;
  industry: string;
  matchedKeywords: string[];
  sourceChannels: string[];
  recommendation: string;
  confidence: number;
  risk: string;
  nextAction: string;
  evidence: EvidenceItem[];
};

export type SearchFilters = {
  keywords: string[];
  region: string;
  type: string;
  industry: string;
  minConfidence: number;
  sources: string[];
};

export type SearchSummary = {
  total: number;
  newLeads: number;
  highMatchCustomers: number;
  supplierCandidates: number;
  needsReview: number;
};
