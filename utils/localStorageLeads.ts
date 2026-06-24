import type { Lead } from "@/data/searchTypes";

export const SAVED_LEADS_KEY = "rubber_growth_saved_leads";

export function getSavedLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_LEADS_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveLead(lead: Lead) {
  const current = getSavedLeads();
  if (current.some((item) => item.id === lead.id)) {
    return { saved: false, leads: current };
  }
  const next = [lead, ...current];
  window.localStorage.setItem(SAVED_LEADS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("rubber-growth-saved-leads"));
  return { saved: true, leads: next };
}
