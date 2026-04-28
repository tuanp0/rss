// import * as cheerio from "cheerio";

// const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
// // const CORS_PROXY = "";

// const extractFirstImage = (html: string): string => {
//   const $ = cheerio.load(html);
//   return $("img").first().attr("src") || "";
// };

// const getRawAttr = (xml: string, tag: string, attr: string): string => {
//   const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, "i");
//   const match = xml.match(regex);
//   return match ? match[1] : "";
// };

// const unwrapCDATA = (str: string): string =>
//   str.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();

// const extractCDATATag = (raw: string, tag: string): string => {
//   const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
//   const match = raw.match(regex);
//   return match ? unwrapCDATA(match[1]) : "";
// };

// export type RSSPost = {
//   title: string;
//   postUrl: string;
//   publishedAt: string;
//   shortDesc: string;
//   content: string;
//   thumbnail: string;
// };

// export async function parseRSSFeed(feedUrl: string): Promise<{ posts: RSSPost[] }> {
//   const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;

//   const res = await fetch(proxiedUrl);

//   if (!res.ok) {
//     throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
//   }

//   const xml = await res.text();
//   const $ = cheerio.load(xml, { xmlMode: true });

//   const posts: RSSPost[] = [];

//   // RSS 2.0
//   $("item").each((_, el) => {
//     const rawEl = $.html(el);

//     const title = unwrapCDATA($(el).find("title").first().text().trim());

//     const postUrl =
//       $(el).find("link").first().text().trim() ||
//       $(el).find("link").first().next().text().trim() ||
//       $(el).find("guid").first().text().trim();

//     const publishedAt = $(el).find("pubDate").first().text().trim();

//     // description can be CDATA-wrapped HTML on Substack
//     const shortDesc = extractCDATATag(rawEl, "description");

//     const contentEncoded = (() => {
//       const match = rawEl.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
//       return match ? unwrapCDATA(match[1]) : "";
//     })();

//     const bodyContent = $(el).find("body").first().html()?.trim() ?? "";
//     const content = contentEncoded || bodyContent;

//     // Substack uses <enclosure> for podcast episodes but not images;
//     // thumbnail fallback chain covers media:thumbnail, media:content, enclosure, first img in content
//     const thumbnail =
//       getRawAttr(rawEl, "media:thumbnail", "url") ||
//       getRawAttr(rawEl, "media:content", "url") ||
//       $(el).find("enclosure[type^='image']").attr("url") ||
//       extractFirstImage(content) ||
//       extractFirstImage(shortDesc) ||
//       "";

//     if (title && postUrl) posts.push({ title, postUrl, publishedAt, shortDesc, content, thumbnail });
//   });

//   // Atom
//   if (posts.length === 0) {
//     $("entry").each((_, el) => {
//       const rawEl = $.html(el);

//       const title = unwrapCDATA($(el).find("title").first().text().trim());

//       const postUrl =
//         $(el).find("link[rel='alternate']").attr("href")?.trim() ||
//         $(el).find("link").attr("href")?.trim() ||
//         $(el).find("id").first().text().trim();

//       const publishedAt = (
//         $(el).find("published").first().text() ||
//         $(el).find("updated").first().text()
//       ).trim();

//       const content =
//         extractCDATATag(rawEl, "content") ||
//         $(el).find("content").first().html()?.trim() ||
//         $(el).find("summary").first().html()?.trim() ||
//         "";

//       const shortDesc =
//         extractCDATATag(rawEl, "summary") ||
//         $(el).find("summary").first().html()?.trim() ||
//         content.slice(0, 300);

//       const thumbnail =
//         getRawAttr(rawEl, "media:thumbnail", "url") ||
//         getRawAttr(rawEl, "media:content", "url") ||
//         extractFirstImage(content) ||
//         extractFirstImage(shortDesc) ||
//         "";

//       if (title && postUrl) posts.push({ title, postUrl, publishedAt, shortDesc, content, thumbnail });
//     });
//   }

//   if (posts.length === 0) {
//     throw new Error("No posts found — feed may not be valid RSS or Atom");
//   }

//   return { posts };
// }

// lib/rssParser.ts
// import { XMLParser } from "fast-xml-parser";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface RSSPost {
//   title: string;
//   postUrl: string;
//   publishedAt: string;
//   shortDesc: string;
//   content: string;
//   thumbnail: string;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function toArray<T>(val: T | T[] | undefined): T[] {
//   if (!val) return [];
//   return Array.isArray(val) ? val : [val];
// }

// function extractText(val: unknown): string {
//   if (val === null || val === undefined) return "";
//   if (typeof val === "string") return val.replace(/\]\]>$/g, "").trim();
//   if (typeof val === "number") return String(val);
//   if (Array.isArray(val)) {
//     // parser sometimes returns [{__cdata: "..."}, ...] for multi-node fields
//     return val.map(extractText).join("").replace(/\]\]>$/g, "").trim();
//   }
//   if (typeof val === "object") {
//     const obj = val as Record<string, unknown>;
//     // fast-xml-parser CDATA shapes: { __cdata: "..." } or { "#text": "..." }
//     if ("__cdata" in obj) return String(obj["__cdata"]).replace(/\]\]>$/g, "").trim();
//     if ("#text" in obj)   return extractText(obj["#text"]);
//     // Some parsers nest as { _: "text" }
//     if ("_" in obj)       return String(obj["_"]).replace(/\]\]>$/g, "").trim();
//   }
//   return "";
// }

// /** Pull the first <img src="..."> out of an HTML string */
// function extractFirstImage(html: string): string | null {
//   const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
//   return match?.[1] ?? null;
// }

// /** Enclosure tag OR first image found in content HTML (works for both WP and Substack) */
// function getThumbnail(
//   raw: Record<string, unknown>,
//   content: string
// ): string {
//   const enclosure = raw["enclosure"] as { "@_url"?: string } | undefined;
//   return enclosure?.["@_url"] ?? extractFirstImage(content) ?? "";
// }

// // ─── XML parser setup ─────────────────────────────────────────────────────────

// const xmlParser = new XMLParser({
//   ignoreAttributes: false,
//   attributeNamePrefix: "@_",
//   cdataPropName: "__cdata",
//   htmlEntities: true,
//   isArray: (tagName) => ["item"].includes(tagName),
// });

// // ─── Feed type detection ──────────────────────────────────────────────────────

// function isSubstack(channel: Record<string, unknown>): boolean {
//   const keys = Object.keys(channel).join(" ");
//   return keys.includes("itunes") || keys.includes("googleplay");
// }

// // ─── CORS proxy ───────────────────────────────────────────────────────────────

// const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
// https://api.rss2json.com/v1/api.json?rss_url=

// // ─── Main export ──────────────────────────────────────────────────────────────

// export async function parseRSSFeed(url: string): Promise<{ posts: RSSPost[] }> {
//   const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
//   const res = await fetch(proxiedUrl, {
//     next: { revalidate: 3600 },
//     headers: { Accept: "application/rss+xml, application/xml, text/xml" },
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch RSS: ${res.status} ${res.statusText}`);
//   }

//   const xml = await res.text();
//   const parsed = xmlParser.parse(xml);
//   console.log(xml)
//   const channel = parsed?.rss?.channel as Record<string, unknown>;

//   if (!channel) throw new Error("Invalid RSS feed: missing <channel>");

//   // isSubstack is kept for future feed-specific logic if needed
//   void isSubstack(channel);

//   const rawItems = toArray(channel.item as Record<string, unknown>[]);

//   const posts = rawItems.map((raw): RSSPost => {
//     const content = extractText(raw["content:encoded"]);

//     return {
//       title:       extractText(raw.title),
//       postUrl:     extractText(raw.link),
//       publishedAt: extractText(raw.pubDate),
//       shortDesc:   extractText(raw.description),
//       content,
//       thumbnail:   getThumbnail(raw, content),
//     };
//   });

//   return { posts };
// }

// // ─── Fetch multiple feeds in parallel ────────────────────────────────────────

// export async function parseMultipleRSSFeeds(
//   urls: string[]
// ): Promise<{ posts: RSSPost[] }[]> {
//   return Promise.all(urls.map(parseRSSFeed));
// }


// import { XMLParser } from "fast-xml-parser";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface RSSPost {
//   title: string;
//   postUrl: string;
//   publishedAt: string;
//   shortDesc: string;
//   content: string;
//   thumbnail: string;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function toArray<T>(val: T | T[] | undefined): T[] {
//   if (!val) return [];
//   return Array.isArray(val) ? val : [val];
// }

// function extractText(val: unknown): string {
//   if (val === null || val === undefined) return "";
//   if (typeof val === "string") return val.replace(/\]\]>$/g, "").trim();
//   if (typeof val === "number") return String(val);
//   if (Array.isArray(val)) {
//     return val.map(extractText).join("").replace(/\]\]>$/g, "").trim();
//   }
//   if (typeof val === "object") {
//     const obj = val as Record<string, unknown>;
//     if ("__cdata" in obj) return String(obj["__cdata"]).replace(/\]\]>$/g, "").trim();
//     if ("#text" in obj) return extractText(obj["#text"]);
//     if ("_" in obj) return String(obj["_"]).replace(/\]\]>$/g, "").trim();
//   }
//   return "";
// }

// function extractFirstImage(html: string): string | null {
//   const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
//   return match?.[1] ?? null;
// }

// function getThumbnail(
//   raw: Record<string, unknown>,
//   content: string
// ): string {
//   const enclosure = raw["enclosure"] as { "@_url"?: string } | undefined;
//   const mediaContent = raw["media:content"] as { "@_url"?: string } | undefined;
//   const mediaThumb = raw["media:thumbnail"] as { "@_url"?: string } | undefined;

//   return (
//     enclosure?.["@_url"] ??
//     mediaContent?.["@_url"] ??
//     mediaThumb?.["@_url"] ??
//     extractFirstImage(content) ??
//     ""
//   );
// }

// // ─── XML parser setup ─────────────────────────────────────────────────────────

// const xmlParser = new XMLParser({
//   ignoreAttributes: false,
//   attributeNamePrefix: "@_",
//   cdataPropName: "__cdata",
//   htmlEntities: true,
//   isArray: (tagName) =>
//     ["item", "category", "media:content"].includes(tagName),
// });

// // ─── Feed type detection ──────────────────────────────────────────────────────

// function isSubstack(channel: Record<string, unknown>): boolean {
//   const keys = Object.keys(channel).join(" ");
//   return keys.includes("itunes") || keys.includes("googleplay");
// }

// // ─── CORS proxies ─────────────────────────────────────────────────────────────

// const CORS_PROXIES = [
//   (url: string) =>
//     `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
//   (url: string) =>
//     `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
// ];

// // ─── Fetch best feed (compare all proxies) ────────────────────────────────────

// async function fetchBestFeed(url: string): Promise<string> {
//   const results: { xml: string; itemCount: number }[] = [];

//   await Promise.all(
//     CORS_PROXIES.map(async (proxy) => {
//       try {
//         const res = await fetch(proxy(url), {
//           headers: {
//             Accept: "application/rss+xml, application/xml, text/xml",
//           },
//         });

//         if (!res.ok) return;

//         const xml = await res.text();

//         // Try parsing to count items
//         const parsed = xmlParser.parse(xml);
//         const items = parsed?.rss?.channel?.item;

//         const count = Array.isArray(items)
//           ? items.length
//           : items
//           ? 1
//           : 0;

//         results.push({ xml, itemCount: count });
//       } catch (err) {
//         console.warn("Proxy failed:", proxy(url), err);
//       }
//     })
//   );

//   if (results.length === 0) {
//     throw new Error("All RSS proxies failed");
//   }

//   // ✅ pick feed with most items
//   results.sort((a, b) => b.itemCount - a.itemCount);

//   return results[0].xml;
// }

// // ─── Main export ──────────────────────────────────────────────────────────────

// export async function parseRSSFeed(
//   url: string
// ): Promise<{ posts: RSSPost[] }> {
//   const xml = await fetchBestFeed(url);
//   const parsed = xmlParser.parse(xml);
//   const channel = parsed?.rss?.channel as Record<string, unknown>;

//   if (!channel) throw new Error("Invalid RSS feed: missing <channel>");

//   void isSubstack(channel);

//   const rawItems = toArray(channel.item as Record<string, unknown>[]);

//   const posts = rawItems.map((raw): RSSPost => {
//     const content = extractText(raw["content:encoded"]);

//     return {
//       title: extractText(raw.title),
//       postUrl: extractText(raw.link),
//       publishedAt: new Date(extractText(raw.pubDate)).toISOString(),
//       shortDesc: extractText(raw.description),
//       content,
//       thumbnail: getThumbnail(raw, content),
//     };
//   });

//   return { posts };
// }

// // ─── Fetch multiple feeds in parallel ────────────────────────────────────────

// export async function parseMultipleRSSFeeds(
//   urls: string[]
// ): Promise<{ posts: RSSPost[] }[]> {
//   const results = await Promise.allSettled(urls.map(parseRSSFeed));

//   return results.map((result) =>
//     result.status === "fulfilled"
//       ? result.value
//       : { posts: [] }
//   );
// }

import { XMLParser } from "fast-xml-parser";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RSSPost {
  title: string;
  postUrl: string;
  publishedAt: string;
  shortDesc: string;
  content: string;
  thumbnail: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function extractText(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val.replace(/\]\]>$/g, "").trim();
  if (typeof val === "number") return String(val);

  if (Array.isArray(val)) {
    return val.map(extractText).join("").replace(/\]\]>$/g, "").trim();
  }

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("__cdata" in obj) return String(obj["__cdata"]).trim();
    if ("#text" in obj) return extractText(obj["#text"]);
    if ("_" in obj) return String(obj["_"]).trim();
  }

  return "";
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function getThumbnail(raw: Record<string, unknown>, content: string): string {
  const enclosure = raw["enclosure"] as { "@_url"?: string } | undefined;
  const mediaContent = raw["media:content"] as { "@_url"?: string } | undefined;
  const mediaThumb = raw["media:thumbnail"] as { "@_url"?: string } | undefined;

  return (
    enclosure?.["@_url"] ??
    mediaContent?.["@_url"] ??
    mediaThumb?.["@_url"] ??
    extractFirstImage(content) ??
    ""
  );
}

// ─── XML Parser ───────────────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  htmlEntities: true,
  isArray: (tagName) =>
    ["item", "category", "media:content"].includes(tagName),
});

// ─── Proxies ──────────────────────────────────────────────────────────────────

const CORS_PROXIES = [
  (url: string) =>
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,

  (url: string) =>
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
];

// ─── Feed types ───────────────────────────────────────────────────────────────

type FeedResult =
  | { type: "xml"; data: string; itemCount: number }
  | { type: "json"; data: any; itemCount: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isJsonResponse(text: string): boolean {
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}

// ─── Fetch best feed ──────────────────────────────────────────────────────────

async function fetchBestFeed(url: string): Promise<FeedResult> {
  const results: FeedResult[] = [];

  await Promise.all(
    CORS_PROXIES.map(async (proxy) => {
      console.log(proxy(url))
      try {
        const res = await fetch(proxy(url));
        if (!res.ok) return;

        const text = await res.text();

        // ─── JSON (rss2json) ─────────────────────────────
        if (isJsonResponse(text)) {
          const json = JSON.parse(text);

          const items = Array.isArray(json?.items) ? json.items : [];
          const count = items.length;
          console.log(count)
          results.push({
            type: "json",
            data: json,
            itemCount: count,
          });

          return;
        }

        // ─── XML (codetabs) ───────────────────────────────
        const parsed = xmlParser.parse(text);
        const channel = parsed?.rss?.channel;

        const items = toArray(channel?.item);
        const count = items.length;
        console.log(count)
        results.push({
          type: "xml",
          data: text,
          itemCount: count,
        });
      } catch (err) {
        console.warn("Proxy failed:", err);
      }
    })
  );
  console.log(results.length)

  if (!results.length) {
    throw new Error("All RSS proxies failed or returned invalid data");
  }

  results.sort((a, b) => b.itemCount - a.itemCount);

  return results[0];
}

// ─── Normalize feed ───────────────────────────────────────────────────────────

function normalizeFeed(result: FeedResult): RSSPost[] {
  // ─── JSON SOURCE ───────────────────────────────────────────
  if (result.type === "json") {
    const items = Array.isArray(result.data?.items)
      ? result.data.items
      : [];

    return items.map((item: any): RSSPost => ({
      title: item.title ?? "",
      postUrl: item.link ?? "",
      publishedAt: new Date(
        item.pubDate ?? item.isoDate ?? Date.now()
      ).toISOString(),
      shortDesc: item.description ?? "",
      content: item.content ?? item.description ?? "",
      thumbnail: item.thumbnail ?? item.enclosure?.link ?? "",
    }));
  }

  // ─── XML SOURCE ────────────────────────────────────────────
  const parsed = xmlParser.parse(result.data);
  const channel = parsed?.rss?.channel;

  const items = toArray(channel?.item);

  return items.map((raw): RSSPost => {
    const content = extractText(raw["content:encoded"]);

    return {
      title: extractText(raw.title),
      postUrl: extractText(raw.link),
      publishedAt: new Date(extractText(raw.pubDate)).toISOString(),
      shortDesc: extractText(raw.description),
      content,
      thumbnail: getThumbnail(raw, content),
    };
  });
}

// ─── MAIN FUNCTION ───────────────────────────────────────────────────────────

// export async function parseRSSFeed(url: string): Promise<RSSPost[]> {
//   const best = await fetchBestFeed(url);
//   console.log(best)
//   return normalizeFeed(best);
// }

export async function parseRSSFeed(
  url: string
): Promise<{ posts: RSSPost[] }> {
  const best = await fetchBestFeed(url);
  const posts = normalizeFeed(best);

  return { posts };
}

// ─── MULTI-FEED SUPPORT ───────────────────────────────────────────────────────

export async function parseMultipleRSSFeeds(
  urls: string[]
): Promise<{ posts: RSSPost[] }[]> {
  const results = await Promise.allSettled(urls.map(parseRSSFeed));

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { posts: [] }
  );
}