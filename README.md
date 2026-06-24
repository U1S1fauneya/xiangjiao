# 橡胶增长中台 Demo

面向橡胶生产制造商的 B2B 线索增长与业务转化前端 Demo。当前重点是第一阶段“找线索工作台”：围绕 EPM、EVM、EPDM、橡胶密封件、混炼胶、汽车橡胶件、线缆橡胶材料等关键词，演示从搜索、清洗、评分到进入线索池的闭环。

## 功能范围

- 找线索工作台：关键词、筛选器、数据来源、搜索结果、AI 洞察、风险提示。
- 线索池：通过 localStorage 保存已加入线索。
- 线索详情：查看推荐理由、风险、下一步行动和证据链接。
- CSV 导出。
- SerpApi 服务端适配层：配置 `SERPAPI_KEY` 后优先调用实时搜索，失败时回退演示数据。
- 其他业务页面为演示壳：总览、邮件开发、商机跟进、生产清单、设置。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Recharts

## 本地运行

```bash
npm install
npm run dev
```

打开：

```txt
http://localhost:3000/search
```

## 配置 SerpApi

复制环境变量模板：

```bash
cp .env.local.example .env.local
```

填写：

```bash
SERPAPI_KEY=your_serpapi_key
SERPAPI_TIMEOUT_MS=9000
```

注意：不要把 `.env.local` 提交到 GitHub。

## 验证

```bash
npm run typecheck
npm run build
```

## 当前边界

这是客户演示 Demo，不是完整生产系统。当前 SerpApi 接入是第一阶段搜索闭环的基础版，后续仍需要继续增强搜索策略、网页内容抓取、AI 分类评分、去重、黑名单过滤、邮件触达和 CRM/生产系统对接。
