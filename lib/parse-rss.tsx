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