import { lookup } from "node:dns/promises";
import net from "node:net";
import type { ContactDiscoveryResponse, ContactItem, ContactPageItem } from "@/data/contactTypes";

type FetchedPage = {
  title: string;
  url: string;
  html: string;
  text: string;
};

type SafeUrlResult =
  | { ok: true; url: URL }
  | { ok: false; reason: "invalid" | "blocked"; message: string };

const MAX_URL_LENGTH = 2048;
const MAX_HTML_BYTES = 900_000;
const MAX_REDIRECTS = 3;
const MAX_CONTACT_PAGES_TO_FETCH = 3;
const REQUEST_TIMEOUT_MS = 9000;

const CONTACT_LINK_PATTERN =
  /contact|contacts|kontakt|inquiry|enquiry|quote|rfq|request|sales|support|about|联系我们|联系|询价|报价/i;
const FILE_URL_PATTERN = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|jpg|jpeg|png|gif|webp|svg|mp4|mp3)(?:[?#]|$)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const STRICT_EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/g;

const commonContactPaths = [
  "/contact",
  "/contact-us",
  "/contacts",
  "/about/contact",
  "/en/contact",
  "/en/contact-us",
  "/request-a-quote",
  "/quote",
  "/inquiry"
];

export async function discoverContacts(rawUrl: string): Promise<ContactDiscoveryResponse> {
  const initial = await validateSafeUrl(rawUrl);
  if (!initial.ok) {
    return createEmptyResponse(initial.reason, initial.message, rawUrl);
  }

  try {
    const primaryPage = await fetchPage(initial.url);
    const contactPages = getContactPageCandidates(primaryPage).slice(0, MAX_CONTACT_PAGES_TO_FETCH);
    const fetchedContactPages = await fetchContactPages(contactPages);
    const pages = [primaryPage, ...fetchedContactPages];
    const emails = uniqueContactItems(pages.flatMap(extractEmails), (item) => item.value.toLowerCase());
    const phones = uniqueContactItems(pages.flatMap(extractPhones), (item) => phoneKey(item.value), true);
    const visibleContactPages = uniqueContactPages(contactPages).slice(0, 6);
    const checkedUrls = pages.map((page) => page.url);

    if (emails.length > 0 || phones.length > 0) {
      return {
        status: "found",
        message: "已在网页中发现可用联系方式，建议进入线索池后由业务人员复核。",
        sourceUrl: primaryPage.url,
        checkedUrls,
        emails: emails.slice(0, 8),
        phones: phones.slice(0, 8),
        contactPages: visibleContactPages
      };
    }

    return {
      status: "not_found",
      message: visibleContactPages.length
        ? "未直接发现公开邮箱或电话，但发现了可能的联系/询价页面。"
        : "未在已抓取网页中发现公开邮箱或电话。",
      sourceUrl: primaryPage.url,
      checkedUrls,
      emails: [],
      phones: [],
      contactPages: visibleContactPages
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "联系方式扫描失败，请稍后重试。",
      sourceUrl: initial.url.toString(),
      checkedUrls: [],
      emails: [],
      phones: [],
      contactPages: []
    };
  }
}

async function fetchContactPages(contactPages: ContactPageItem[]) {
  const pages: FetchedPage[] = [];

  for (const item of contactPages.slice(0, MAX_CONTACT_PAGES_TO_FETCH)) {
    const safe = await validateSafeUrl(item.url);
    if (!safe.ok) continue;

    try {
      pages.push(await fetchPage(safe.url));
    } catch {
      // A blocked or unavailable contact page should not invalidate the main result.
    }
  }

  return pages;
}

async function fetchPage(url: URL): Promise<FetchedPage> {
  const response = await fetchWithSafeRedirects(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
    throw new Error("网页内容不是可解析的 HTML 文本。");
  }

  const html = await readLimitedBody(response);
  const title = extractTitle(html) || normalizeHostname(new URL(response.url).hostname);

  return {
    title,
    url: response.url,
    html,
    text: htmlToText(html)
  };
}

async function fetchWithSafeRedirects(initialUrl: URL) {
  let currentUrl = initialUrl;

  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    const safe = await validateSafeUrl(currentUrl.toString());
    if (!safe.ok) {
      throw new Error(safe.message);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(safe.url, {
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.2",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
        }
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error("网页发生跳转，但没有返回跳转地址。");
        currentUrl = new URL(location, safe.url);
        continue;
      }

      if (!response.ok) {
        throw new Error(`网页访问失败，HTTP 状态码 ${response.status}。`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("网页访问超时。");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("网页跳转次数过多，已停止扫描。");
}

async function readLimitedBody(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (totalBytes >= MAX_HTML_BYTES) break;
  }

  html += decoder.decode();
  return html;
}

async function validateSafeUrl(rawUrl: string): Promise<SafeUrlResult> {
  const value = rawUrl.trim();
  if (!value || value.length > MAX_URL_LENGTH) {
    return { ok: false, reason: "invalid", message: "网页地址为空或过长。" };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "invalid", message: "网页地址格式无效。" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "invalid", message: "只支持 http 或 https 网页。" };
  }

  if (url.username || url.password) {
    return { ok: false, reason: "invalid", message: "网页地址不能包含账号密码。" };
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return { ok: false, reason: "blocked", message: "该网页地址不是公开网站，已阻止扫描。" };
  }

  if (url.port && !["80", "443"].includes(url.port)) {
    return { ok: false, reason: "blocked", message: "该网页端口不在允许范围内，已阻止扫描。" };
  }

  const literalIpVersion = net.isIP(hostname);
  if (literalIpVersion && !isPublicIp(hostname)) {
    return { ok: false, reason: "blocked", message: "该网页地址指向内网或保留 IP，已阻止扫描。" };
  }

  try {
    const allowSyntheticProxy = !literalIpVersion && process.env.NODE_ENV === "development";
    const addresses = literalIpVersion ? [{ address: hostname }] : await lookup(hostname, { all: true });
    if (addresses.length === 0 || addresses.some((item) => !isPublicIp(item.address, { allowSyntheticProxy }))) {
      return { ok: false, reason: "blocked", message: "该网站解析到内网或保留地址，已阻止扫描。" };
    }
  } catch {
    return { ok: false, reason: "blocked", message: "无法解析该网站域名，已停止扫描。" };
  }

  return { ok: true, url };
}

function getContactPageCandidates(page: FetchedPage): ContactPageItem[] {
  const anchors = Array.from(page.html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi));
  const baseUrl = new URL(page.url);
  const candidates: ContactPageItem[] = [];

  for (const match of anchors) {
    const href = (match[1] || match[2] || match[3] || "").trim();
    const label = htmlToText(match[4] || "").trim();
    const searchable = `${href} ${label}`;
    if (!href || !CONTACT_LINK_PATTERN.test(searchable) || FILE_URL_PATTERN.test(href)) continue;

    const absoluteUrl = toSameHostUrl(href, baseUrl);
    if (!absoluteUrl) continue;

    candidates.push({
      title: label || inferLinkTitle(absoluteUrl),
      url: absoluteUrl
    });
  }

  for (const path of commonContactPaths) {
    candidates.push({
      title: inferLinkTitle(path),
      url: new URL(path, baseUrl.origin).toString()
    });
  }

  return uniqueContactPages(candidates).sort((a, b) => contactPageScore(b) - contactPageScore(a));
}

function extractEmails(page: FetchedPage): ContactItem[] {
  const values = [
    ...Array.from(page.html.matchAll(/href\s*=\s*["']mailto:([^"'?#]+)[^"']*["']/gi)).map((match) => match[1]),
    ...Array.from(page.text.matchAll(EMAIL_PATTERN)).map((match) => match[0])
  ];

  return values
    .map((value) => normalizeEmail(value))
    .filter(isLikelyBusinessEmail)
    .map((value) => ({ value, sourceUrl: page.url, sourceTitle: page.title }));
}

function extractPhones(page: FetchedPage): ContactItem[] {
  const telLinks = Array.from(page.html.matchAll(/href\s*=\s*["']tel:([^"']+)["']/gi)).map((match) => match[1]);
  const textPhones = Array.from(page.text.matchAll(PHONE_PATTERN))
    .filter((match) => isLikelyPhoneMatch(page.text, match.index ?? 0, match[0]))
    .map((match) => match[0]);

  return [...telLinks, ...textPhones]
    .map((value) => normalizePhone(value))
    .filter(isLikelyPhone)
    .map((value) => ({ value, sourceUrl: page.url, sourceTitle: page.title }));
}

function normalizeEmail(value: string) {
  return decodeURIComponent(value).trim().toLowerCase().replace(/^mailto:/i, "");
}

function normalizePhone(value: string) {
  return value
    .replace(/^tel:/i, "")
    .replace(/[^\d+().\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyBusinessEmail(value: string) {
  if (!STRICT_EMAIL_PATTERN.test(value)) return false;
  if (/@example\./i.test(value) || /@(domain|email)\./i.test(value)) return false;
  if (/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(value)) return false;
  return true;
}

function isLikelyPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 16) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

function isLikelyPhoneMatch(text: string, index: number, value: string) {
  if (value.trim().startsWith("+")) return true;
  const context = text.slice(Math.max(0, index - 32), Math.min(text.length, index + value.length + 32));
  return /phone|tel|fax|mobile|call|contact|sales|电话|传真|手机|联系/i.test(context);
}

function uniqueContactItems(items: ContactItem[], getKey: (item: ContactItem) => string, preferFormatted = false) {
  const seen = new Map<string, number>();
  const unique: ContactItem[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    const existingIndex = seen.get(key);
    if (existingIndex !== undefined) {
      if (preferFormatted && displayFormatScore(item.value) > displayFormatScore(unique[existingIndex].value)) {
        unique[existingIndex] = item;
      }
      continue;
    }
    seen.set(key, unique.length);
    unique.push(item);
  }

  return unique;
}

function phoneKey(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits;
}

function displayFormatScore(value: string) {
  return value.replace(/[A-Za-z0-9]/g, "").length;
}

function uniqueContactPages(items: ContactPageItem[]) {
  const seen = new Set<string>();
  const unique: ContactPageItem[] = [];

  for (const item of items) {
    const url = stripHash(item.url);
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push({ ...item, url });
  }

  return unique;
}

function stripHash(rawUrl: string) {
  const url = new URL(rawUrl);
  url.hash = "";
  return url.toString();
}

function toSameHostUrl(href: string, baseUrl: URL) {
  if (/^(mailto|tel|javascript):/i.test(href)) return "";

  try {
    const url = new URL(href, baseUrl);
    if (url.hostname !== baseUrl.hostname) return "";
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function inferLinkTitle(rawUrlOrPath: string) {
  const lastPart = rawUrlOrPath.split(/[/?#]/).filter(Boolean).pop() || "联系页面";
  return lastPart
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function contactPageScore(page: ContactPageItem) {
  const value = `${page.title} ${page.url}`.toLowerCase();
  if (/contact|contacts|kontakt|联系我们|联系/.test(value)) return 50;
  if (/inquiry|enquiry|quote|rfq|request|询价|报价/.test(value)) return 42;
  if (/sales|support/.test(value)) return 34;
  if (/about/.test(value)) return 10;
  return 1;
}

function extractTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? htmlToText(title).trim().slice(0, 120) : "";
}

function htmlToText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<(br|p|div|li|tr|section|article|header|footer)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeHostname(hostname: string) {
  return hostname.replace(/^www\./, "");
}

function createEmptyResponse(
  status: ContactDiscoveryResponse["status"],
  message: string,
  sourceUrl: string
): ContactDiscoveryResponse {
  return {
    status,
    message,
    sourceUrl,
    checkedUrls: [],
    emails: [],
    phones: [],
    contactPages: []
  };
}

function isPublicIp(address: string, options?: { allowSyntheticProxy?: boolean }) {
  const version = net.isIP(address);
  if (version === 4) return isPublicIpv4(address, options);
  if (version === 6) return isPublicIpv6(address);
  return false;
}

function isPublicIpv4(address: string, options?: { allowSyntheticProxy?: boolean }) {
  const value = ipv4ToNumber(address);
  const blockedCidrs: Array<[string, number]> = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.168.0.0", 16],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4]
  ];

  if (!options?.allowSyntheticProxy) blockedCidrs.push(["198.18.0.0", 15]);

  return !blockedCidrs.some(([range, prefix]) => isIpv4InCidr(value, ipv4ToNumber(range), prefix));
}

function ipv4ToNumber(address: string) {
  return address
    .split(".")
    .map(Number)
    .reduce((value, part) => (value << 8) + part, 0) >>> 0;
}

function isIpv4InCidr(value: number, range: number, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) === (range & mask);
}

function isPublicIpv6(address: string) {
  const value = ipv6ToBigInt(address);
  if (value === null) return false;

  const blockedCidrs: Array<[string, number]> = [
    ["::", 128],
    ["::1", 128],
    ["::ffff:0:0", 96],
    ["64:ff9b::", 96],
    ["100::", 64],
    ["2001:db8::", 32],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8]
  ];

  return !blockedCidrs.some(([range, prefix]) => {
    const rangeValue = ipv6ToBigInt(range);
    return rangeValue !== null && isIpv6InCidr(value, rangeValue, prefix);
  });
}

function ipv6ToBigInt(address: string) {
  const expanded = expandIpv6(address);
  if (!expanded) return null;

  return expanded.reduce((value, part) => (value << BigInt(16)) + BigInt(Number.parseInt(part, 16)), BigInt(0));
}

function expandIpv6(address: string) {
  if (address.includes(".")) return null;

  const [leftPart, rightPart] = address.toLowerCase().split("::");
  const left = leftPart ? leftPart.split(":").filter(Boolean) : [];
  const right = rightPart ? rightPart.split(":").filter(Boolean) : [];

  if (left.length + right.length > 8) return null;

  const missing = 8 - left.length - right.length;
  const groups = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;

  return groups;
}

function isIpv6InCidr(value: bigint, range: bigint, prefix: number) {
  if (prefix === 0) return true;
  const mask = ((BigInt(1) << BigInt(prefix)) - BigInt(1)) << BigInt(128 - prefix);
  return (value & mask) === (range & mask);
}
