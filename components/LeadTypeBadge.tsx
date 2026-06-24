import type { LeadGrade, LeadType } from "@/data/searchTypes";

const typeClass: Record<LeadType, string> = {
  客户: "bg-emerald-50 text-emerald-700 border-emerald-200",
  供应商: "bg-blue-50 text-blue-700 border-blue-200",
  贸易商: "bg-violet-50 text-violet-700 border-violet-200",
  待确认: "bg-orange-50 text-orange-700 border-orange-200"
};

const gradeClass: Record<LeadGrade, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-orange-50 text-orange-700 border-orange-200"
};

export function LeadTypeBadge({ type }: { type: LeadType }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${typeClass[type]}`}>
      {type}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: LeadGrade }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${gradeClass[grade]}`}>
      {grade} 级
    </span>
  );
}
