"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Mail, Phone, RefreshCw } from "lucide-react";
import type { ContactDiscoveryResponse, ContactItem, ContactPageItem } from "@/data/contactTypes";

type LoadState = "idle" | "loading" | "success" | "error";

export function ContactDiscoveryPanel({
  sourceUrl,
  disabled,
  leadId
}: {
  sourceUrl: string;
  disabled?: boolean;
  leadId: string;
}) {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [data, setData] = useState<ContactDiscoveryResponse | null>(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const hasContacts = useMemo(() => Boolean(data && (data.emails.length > 0 || data.phones.length > 0)), [data]);

  useEffect(() => {
    if (disabled || !sourceUrl) {
      setLoadState("idle");
      setData(null);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoadState("loading");
    setError("");

    fetch(`/api/contact-discovery?url=${encodeURIComponent(sourceUrl)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as ContactDiscoveryResponse;
        setData(payload);
        setLoadState(response.ok ? "success" : "error");
        if (!response.ok) setError(payload.message);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setLoadState("error");
        setData(null);
        setError("联系方式扫描失败，请稍后重试。");
      });

    return () => controller.abort();
  }, [disabled, leadId, retryKey, sourceUrl]);

  if (disabled || !sourceUrl) {
    return (
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <PanelHeader statusText="未扫描" />
        <p className="mt-3 text-sm leading-6 text-slate-500">当前线索没有真实网页地址，暂不进行联系方式扫描。</p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/45 p-4">
      <PanelHeader
        statusText={loadState === "loading" ? "扫描中" : hasContacts ? "已发现" : data?.status === "not_found" ? "待人工确认" : "未完成"}
        onRetry={() => setRetryKey((value) => value + 1)}
        retryDisabled={loadState === "loading"}
      />

      {loadState === "loading" ? (
        <LoadingRows />
      ) : loadState === "error" ? (
        <ErrorState message={error || data?.message || "联系方式扫描失败。"} />
      ) : data ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/80 bg-white p-3">
            <div className="flex items-start gap-2">
              {hasContacts ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <p className="text-sm leading-6 text-slate-600">{data.message}</p>
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">已检查 {data.checkedUrls.length || 1} 个网页入口</div>
          </div>

          {data.emails.length > 0 ? <ContactList title="邮箱" icon="mail" items={data.emails} /> : null}
          {data.phones.length > 0 ? <ContactList title="电话" icon="phone" items={data.phones} /> : null}
          {data.contactPages.length > 0 ? <ContactPages pages={data.contactPages} /> : null}
        </div>
      ) : null}
    </section>
  );
}

function PanelHeader({
  statusText,
  onRetry,
  retryDisabled
}: {
  statusText: string;
  onRetry?: () => void;
  retryDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-black text-navy-950">
        <Mail className="h-4 w-4 text-emerald-600" />
        联系方式发现
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-emerald-700">{statusText}</span>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retryDisabled}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-2.5 text-xs font-black text-emerald-700 disabled:text-slate-400"
        >
          {retryDisabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          重新扫描
        </button>
      ) : null}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="mt-4 space-y-2" aria-busy="true" aria-label="正在扫描联系方式">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-12 animate-pulse rounded-xl bg-white/80" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-amber-100 bg-white p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function ContactList({ title, icon, items }: { title: string; icon: "mail" | "phone"; items: ContactItem[] }) {
  const Icon = icon === "mail" ? Mail : Phone;

  return (
    <div>
      <div className="mb-2 text-xs font-black text-slate-500">{title}</div>
      <div className="space-y-2">
        {items.map((item) => {
          const href = icon === "mail" ? `mailto:${item.value}` : `tel:${item.value.replace(/[^\d+]/g, "")}`;

          return (
            <a
              key={`${item.value}-${item.sourceUrl}`}
              href={href}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-white/80 bg-white p-3 text-sm font-black text-navy-950 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-all">{item.value}</span>
                {item.sourceTitle ? (
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">{item.sourceTitle}</span>
                ) : null}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ContactPages({ pages }: { pages: ContactPageItem[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-black text-slate-500">可能的联系页</div>
      <div className="space-y-2">
        {pages.map((page) => (
          <a
            key={page.url}
            href={page.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/80 bg-white p-3 text-sm font-black text-navy-950 transition hover:border-blue-200 hover:text-growth-blue"
          >
            <span className="truncate">{page.title}</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
