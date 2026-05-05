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

// function toArray<T>(val: T | T[] | undefined | null): T[] {
//   if (!val) return [];
//   return Array.isArray(val) ? val : [val];
// }

// function extractText(val: unknown): string {
//   if (!val) return "";
//   if (typeof val === "string") return val.replace(/\]\]>$/g, "").trim();
//   if (typeof val === "number") return String(val);

//   if (Array.isArray(val)) {
//     return val.map(extractText).join("").replace(/\]\]>$/g, "").trim();
//   }

//   if (typeof val === "object") {
//     const obj = val as Record<string, unknown>;
//     if ("__cdata" in obj) return String(obj["__cdata"]).trim();
//     if ("#text" in obj) return extractText(obj["#text"]);
//     if ("_" in obj) return String(obj["_"]).trim();
//   }

//   return "";
// }

// function extractFirstImage(html: string): string | null {
//   const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
//   return match?.[1] ?? null;
// }

// function getThumbnail(raw: Record<string, unknown>, content: string): string {
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

// // ─── XML Parser ───────────────────────────────────────────────────────────────

// const xmlParser = new XMLParser({
//   ignoreAttributes: false,
//   attributeNamePrefix: "@_",
//   cdataPropName: "__cdata",
//   htmlEntities: true,
//   isArray: (tagName) =>
//     ["item", "category", "media:content"].includes(tagName),
// });

// // ─── Proxies ──────────────────────────────────────────────────────────────────

// const CORS_PROXIES = [
//   (url: string) =>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
//   (url: string) =>`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
// ];

// // ─── Feed types ───────────────────────────────────────────────────────────────

// type FeedResult =
//   | { type: "xml"; data: string; itemCount: number }
//   | { type: "json"; data: any; itemCount: number };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function isJsonResponse(text: string): boolean {
//   const t = text.trim();
//   return t.startsWith("{") || t.startsWith("[");
// }

// // ─── Fetch best feed ──────────────────────────────────────────────────────────

// async function fetchBestFeed(url: string): Promise<FeedResult> {
//   const results: FeedResult[] = [];

//   await Promise.all(
//     CORS_PROXIES.map(async (proxy) => {

//       try {
//         const res = await fetch(proxy(url));
//         if (!res.ok) return;

//         const text = await res.text();

//         // ─── JSON (rss2json) ─────────────────────────────
//         if (isJsonResponse(text)) {
//           const json = JSON.parse(text);

//           const items = Array.isArray(json?.items) ? json.items : [];
//           const count = items.length;

//           results.push({
//             type: "json",
//             data: json,
//             itemCount: count,
//           });

//           return;
//         }

//         // ─── XML (codetabs) ───────────────────────────────
//         const parsed = xmlParser.parse(text);
//         const channel = parsed?.rss?.channel;

//         const items = toArray(channel?.item);
//         const count = items.length;

//         results.push({
//           type: "xml",
//           data: text,
//           itemCount: count,
//         });
//       } catch (err) {
//         console.warn("Proxy failed:", err);
//       }
//     })
//   );

//   if (!results.length) {
//     throw new Error("All RSS proxies failed or returned invalid data");
//   }

//   results.sort((a, b) => b.itemCount - a.itemCount);

//   return results[0];
// }

// // ─── Normalize feed ───────────────────────────────────────────────────────────

// function normalizeFeed(result: FeedResult): RSSPost[] {

//   // ─── JSON SOURCE ───────────────────────────────────────────
//   // if (result.type === "json") {
//   //   const items = Array.isArray(result.data?.items)
//   //     ? result.data.items
//   //     : [];

//   //   return items.map((item: any): RSSPost => ({
//   //     title: item.title ?? "",
//   //     postUrl: item.link ?? "",
//   //     publishedAt: new Date(
//   //       item.pubDate ?? item.isoDate ?? Date.now()
//   //     ).toISOString(),
//   //     shortDesc: item.description ?? "",
//   //     content: item.content ?? item.description ?? "",
//   //     thumbnail: item.thumbnail ?? item.enclosure?.link ?? "",
//   //   }));
//   // }

//   if (result.type === "json") {
//   const items = Array.isArray(result.data?.items) ? result.data.items : [];

//   return items.map((item: any): RSSPost => {
//     const content = item.content ?? item.description ?? "";

//     const thumbnail =
//       item.thumbnail ||
//       item.enclosure?.link ||
//       extractFirstImage(content) ||
//       extractFirstImage(item.description ?? "") ||
//       "";

//     return {
//       title: item.title ?? "",
//       postUrl: item.link ?? "",
//       publishedAt: new Date(
//         item.pubDate ?? item.isoDate ?? Date.now()
//       ).toISOString(),
//       shortDesc: item.description ?? "",
//       content,
//       thumbnail,
//     };
//   });
// }

//   // ─── XML SOURCE ────────────────────────────────────────────
//   const parsed = xmlParser.parse(result.data);
//   const channel = parsed?.rss?.channel;

//   const items = toArray(channel?.item);

//   return items.map((raw): RSSPost => {
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
// }

// // ─── MAIN FUNCTION ───────────────────────────────────────────────────────────

// export async function parseRSSFeed(
//   url: string
// ): Promise<{ posts: RSSPost[] }> {
//   const best = await fetchBestFeed(url);
//   const posts = normalizeFeed(best);

//   return { posts };
// }

// // ─── MULTI-FEED SUPPORT ───────────────────────────────────────────────────────

// // export async function parseMultipleRSSFeeds(
// //   urls: string[]
// // ): Promise<{ posts: RSSPost[] }[]> {
// //   const results = await Promise.allSettled(urls.map(parseRSSFeed));

// //   return results.map((r) =>
// //     r.status === "fulfilled"
// //       ? r.value
// //       : { posts: [] }
// //   );
// // }

import { XMLParser } from "fast-xml-parser";
import { Readability } from "@mozilla/readability";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RSSPost {
  title: string;
  postUrl: string;
  publishedAt: string;
  shortDesc: string;
  content: string;
  textContent: string;
  thumbnail: string;
  byline: string;
  siteName: string;
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

const NON_IMAGE_URL_PATTERNS = [
  /youtu\.be/i,
  /youtube\.com/i,
  /vimeo\.com/i,
  /dailymotion\.com/i,
];

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  return !NON_IMAGE_URL_PATTERNS.some((pattern) => pattern.test(url));
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const url = match?.[1] ?? null;
  return url && isValidImageUrl(url) ? url : null;
}

function getThumbnail(raw: Record<string, unknown>, content: string): string {
  const enclosure = raw["enclosure"] as { "@_url"?: string } | undefined;
  const mediaContent = raw["media:content"] as { "@_url"?: string } | undefined;
  const mediaThumb = raw["media:thumbnail"] as { "@_url"?: string } | undefined;

  const candidates = [
    enclosure?.["@_url"],
    mediaContent?.["@_url"],
    mediaThumb?.["@_url"],
    extractFirstImage(content),
  ];

  return candidates.find((url) => url && isValidImageUrl(url)) ?? "";
}

// ─── Readability extraction ───────────────────────────────────────────────────

/**
 * Fetches a post URL through the CORS proxy, then runs Readability on the HTML
 * using the native browser DOMParser — no jsdom, no Node.js, works everywhere
 * including fully static Next.js builds.
 */
async function extractWithReadability(
  postUrl: string,
  corsProxy: string
): Promise<{
  content: string;
  textContent: string;
  thumbnail: string;
  byline: string;
  siteName: string;
}> {
  const empty = { content: "", textContent: "", thumbnail: "", byline: "", siteName: "" };

  try {
    const proxied = `${corsProxy}${encodeURIComponent(postUrl)}`;
    const res = await fetch(proxied);
    if (!res.ok) return empty;

    const html = await res.text();

    // Use the native browser DOMParser — no jsdom needed, no Node.js dependency.
    // Works in the browser, Next.js edge runtime, and fully static exports.
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Inject a <base> tag so Readability resolves relative image/link URLs
    // against the original post URL rather than the proxy URL.
    const base = doc.createElement("base");
    base.href = postUrl;
    doc.head.prepend(base);

    const article = new Readability(doc).parse();
    if (!article) return empty;

    return {
      content: article.content ?? "",
      textContent: article.textContent ?? "",
      thumbnail: extractFirstImage(article.content ?? "") ?? "",
      byline: article.byline ?? "",
      siteName: article.siteName ?? "",
    };
  } catch (err) {
    console.warn(`Readability failed for ${postUrl}:`, err);
    return empty;
  }
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

const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";

const CORS_PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
];

// ─── Feed types ───────────────────────────────────────────────────────────────

type FeedResult =
  | { type: "xml"; data: string; itemCount: number }
  | { type: "json"; data: any; itemCount: number };

function isJsonResponse(text: string): boolean {
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}

// ─── Fetch best feed ──────────────────────────────────────────────────────────

async function fetchBestFeed(url: string): Promise<FeedResult> {
  const results: FeedResult[] = [];

  await Promise.all(
    CORS_PROXIES.map(async (proxy) => {
      try {
        const res = await fetch(proxy(url));
        if (!res.ok) return;

        const text = await res.text();

        if (isJsonResponse(text)) {
          const json = JSON.parse(text);
          const items = Array.isArray(json?.items) ? json.items : [];
          results.push({ type: "json", data: json, itemCount: items.length });
          return;
        }

        const parsed = xmlParser.parse(text);
        const channel = parsed?.rss?.channel;
        const items = toArray(channel?.item);

        results.push({ type: "xml", data: text, itemCount: items.length });
      } catch (err) {
        console.warn("Proxy failed:", err);
      }
    })
  );

  if (!results.length) {
    throw new Error("All RSS proxies failed or returned invalid data");
  }

  results.sort((a, b) => b.itemCount - a.itemCount);
  return results[0];
}

// ─── Raw post extraction (metadata + URLs only) ───────────────────────────────

interface RawPost {
  title: string;
  postUrl: string;
  publishedAt: string;
  shortDesc: string;
  fallbackThumbnail: string;
}

function extractRawPosts(result: FeedResult): RawPost[] {
  if (result.type === "json") {
    const items = Array.isArray(result.data?.items) ? result.data.items : [];

    return items.map((item: any): RawPost => {
      const desc = item.description ?? "";
      return {
        title: item.title ?? "",
        postUrl: item.link ?? "",
        publishedAt: new Date(item.pubDate ?? item.isoDate ?? Date.now()).toISOString(),
        shortDesc: desc,
        fallbackThumbnail:
          [
            item.thumbnail,
            item.enclosure?.link,
            extractFirstImage(item.content ?? ""),
            extractFirstImage(desc),
          ].find((url) => url && isValidImageUrl(url)) ?? "",
      };
    });
  }

  // XML
  const parsed = xmlParser.parse(result.data);
  const channel = parsed?.rss?.channel;
  const items = toArray(channel?.item);

  return items.map((raw): RawPost => {
    const content = extractText(raw["content:encoded"]);
    return {
      title: extractText(raw.title),
      postUrl: extractText(raw.link),
      publishedAt: new Date(extractText(raw.pubDate)).toISOString(),
      shortDesc: extractText(raw.description),
      fallbackThumbnail: getThumbnail(raw, content),
    };
  });
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

export async function parseRSSFeed(
  url: string,
  options: {
    /**
     * How many posts to fully extract with Readability.
     * Keep this low (5–10) to avoid hammering the target site and the proxy.
     * Defaults to 10.
     */
    maxFullContent?: number;

    /**
     * If true, all posts are fetched in parallel (faster but heavier on the proxy).
     * If false, posts are fetched sequentially with a 300ms delay (gentler).
     * Defaults to false.
     */
    parallel?: boolean;
  } = {}
): Promise<{ posts: RSSPost[] }> {
  const { maxFullContent = 20, parallel = true } = options;

  const best = await fetchBestFeed(url);
  const rawPosts = extractRawPosts(best).slice(0, maxFullContent);

  let posts: RSSPost[];

  if (parallel) {
    posts = await Promise.all(
      rawPosts.map(async (raw): Promise<RSSPost> => {
        const readability = await extractWithReadability(raw.postUrl, CORS_PROXY);
        return {
          title: raw.title,
          postUrl: raw.postUrl,
          publishedAt: raw.publishedAt,
          shortDesc: raw.shortDesc,
          content: readability.content,
          textContent: readability.textContent,
          thumbnail: readability.thumbnail || raw.fallbackThumbnail,
          byline: readability.byline,
          siteName: readability.siteName,
        };
      })
    );
  } else {
    posts = [];
    for (const raw of rawPosts) {
      const readability = await extractWithReadability(raw.postUrl, CORS_PROXY);
      posts.push({
        title: raw.title,
        postUrl: raw.postUrl,
        publishedAt: raw.publishedAt,
        shortDesc: raw.shortDesc,
        content: readability.content,
        textContent: readability.textContent,
        thumbnail: readability.thumbnail || raw.fallbackThumbnail,
        byline: readability.byline,
        siteName: readability.siteName,
      });

      // Small delay — be a polite scraper
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return { posts };
}