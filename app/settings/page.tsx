"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { StaticPlaceholderPage } from "@/components/StaticPlaceholderPage";

const settingKey = "rubber_growth_demo_settings";
const defaultKeywords = ["EPM", "EVM", "EPDM", "橡胶密封件", "混炼胶", "HFFR", "FRNC"];
const defaultSources = ["搜索引擎", "企业官网", "B2B 平台", "行业目录", "展会协会", "招投标"];

export default function SettingsPage() {
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [sources, setSources] = useState(defaultSources);

  useEffect(() => {
    const raw = window.localStorage.getItem(settingKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { keywords: string[]; sources: string[] };
      setKeywords(parsed.keywords);
      setSources(parsed.sources);
    }
  }, []);

  function save() {
    window.localStorage.setItem(settingKey, JSON.stringify({ keywords, sources }));
  }

  return (
    <StaticPlaceholderPage title="设置" subtitle="配置搜索策略、关键词组和数据源开关，本 Demo 保存到 localStorage" icon={Settings}>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-slate-50 p-5">
          <h2 className="text-xl font-black text-navy-950">关键词组</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {keywords.map((item) => (
              <span key={item} className="rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">{item}</span>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-slate-50 p-5">
          <h2 className="text-xl font-black text-navy-950">数据源开关</h2>
          <div className="mt-4 grid gap-3">
            {defaultSources.map((source) => (
              <label key={source} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 font-bold">
                {source}
                <input
                  type="checkbox"
                  checked={sources.includes(source)}
                  onChange={(event) => {
                    setSources(event.target.checked ? [...sources, source] : sources.filter((item) => item !== source));
                  }}
                />
              </label>
            ))}
          </div>
          <button onClick={save} className="mt-5 h-11 rounded-xl bg-growth-blue px-6 font-black text-white">保存配置</button>
        </section>
      </div>
    </StaticPlaceholderPage>
  );
}
