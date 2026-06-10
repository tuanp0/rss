import * as cheerio from "cheerio";

// const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
const CORS_PROXY = "https://rss.tuanphung.com/proxy/?url=";


export type RSSFeed = {
  href: string;
  title: string;
  type: string;
  favicon: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(imageUrl)}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = res.headers.get("content-type") || "image/png";

  return `data:${contentType};base64,${base64}`;
}

async function extractFaviconBase64(
  $: cheerio.CheerioAPI,
  baseUrl: string
): Promise<string> {
  const icon =
    $('link[rel="icon"][sizes="48x48"]').attr("href") ||
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"][sizes="152x152"]').attr("href") ||
    "/favicon.ico";

  const absolute = icon.startsWith("http")
    ? icon
    : new URL(icon, baseUrl).href;

  try {
    return await imageUrlToBase64(absolute);
  } catch {
    return "";
  }
}

// ─── Direct feed detection ─────────────────────────────────────────────────────

/**
 * Patterns tested against the pathname for obvious feed URLs.
 */
const FEED_PATH_PATTERNS = [
  /\/(feed|rss|atom)(\.xml)?(\/|$|\?)/i,
  /\/(feed|rss|atom)\//i,
  /\/(index\.xml)(\/|$|\?)/i,
  /\.(rss|atom|xml)(\?.*)?$/i,
];

/**
 * Patterns tested against the full URL (pathname + query string).
 * Catches cases like ?outputType=xml or ?format=rss that aren't in the path.
 */
const FEED_QUERY_PATTERNS = [
  /[?&]outputType=xml/i,
  /[?&]format=(rss|atom|xml|feed)/i,
  /[?&]type=(rss|atom|xml|feed)/i,
];

function looksLikeFeedUrl(url: string): boolean {
  const { pathname, search } = new URL(url);
  return (
    FEED_PATH_PATTERNS.some((p) => p.test(pathname)) ||
    FEED_QUERY_PATTERNS.some((p) => p.test(search))
  );
}

/**
 * Content-type values that confirm a response is a feed.
 */
const FEED_CONTENT_TYPES = [
  "application/rss+xml",
  "application/atom+xml",
  "application/feed+json",
  "application/xml",
  "text/xml",
];

function isFeedContentType(contentType: string): boolean {
  return FEED_CONTENT_TYPES.some((type) => contentType.includes(type));
}

/**
 * Sniffs the first non-whitespace characters of the response body to detect
 * XML/RSS/Atom/JSON feeds without relying solely on Content-Type headers
 * (many servers send text/html even for feeds).
 */
function isFeedBody(text: string): boolean {
  const t = text.trimStart();

  // XML-based feeds (RSS, Atom)
  if (t.startsWith("<?xml") || t.startsWith("<rss") || t.startsWith("<feed")) {
    return true;
  }

  // JSON Feed
  if (t.startsWith("{")) {
    try {
      const json = JSON.parse(t);
      // JSON Feed spec requires a "version" field starting with "https://jsonfeed.org"
      return typeof json?.version === "string" && json.version.startsWith("https://jsonfeed.org");
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Extracts the feed title from raw feed XML/JSON text.
 * Falls back to the URL hostname if nothing is found.
 */
function extractFeedTitle(text: string, fallbackUrl: string): string {
  // RSS: <title>...</title> near the top
  const rssMatch = text.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  if (rssMatch?.[1]) return rssMatch[1].trim();

  // JSON Feed: "title" field
  try {
    const json = JSON.parse(text);
    if (json?.title) return json.title;
  } catch {
    // not JSON, ignore
  }

  return new URL(fallbackUrl).hostname;
}

/**
 * Tries to fetch the favicon from the feed's origin site.
 * Since we only have the feed URL here (not an HTML page), we fetch the
 * homepage HTML just for the favicon, then discard the rest.
 */
async function fetchFaviconForOrigin(feedUrl: string): Promise<string> {
  try {
    const origin = new URL(feedUrl).origin;
    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(origin)}`);
    if (!res.ok) return "";

    const html = await res.text();
    const $ = cheerio.load(html);
    return await extractFaviconBase64($, origin);
  } catch {
    return "";
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function findRSSFeeds(url: string): Promise<RSSFeed[]> {
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;

  const res = await fetch(proxied);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);

  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";

  // ── Fast path: the URL is already a feed ──────────────────────────────────
  //
  // We check three signals in order:
  //   1. URL pattern  ("/feed", ".xml", etc.)
  //   2. Content-Type header
  //   3. Body sniffing (covers servers that send wrong Content-Type)
  //
  // Any one of these is sufficient to treat the URL as a direct feed.

  if (
    looksLikeFeedUrl(url) ||
    isFeedContentType(contentType) ||
    isFeedBody(text)
  ) {
    const title = extractFeedTitle(text, url);
    const favicon = await fetchFaviconForOrigin(url);

    // Derive a best-guess type from content-type or body
    const type = isFeedContentType(contentType)
      ? contentType.split(";")[0].trim()
      : text.trimStart().startsWith("{")
      ? "application/feed+json"
      : "application/rss+xml";

    return [{ href: url, title, type, favicon }];
  }

  // ── Slow path: the URL is an HTML page, discover feeds inside it ──────────

  const feeds: RSSFeed[] = [];
  const $ = cheerio.load(text);
  const favicon = await extractFaviconBase64($, url);

  // 1. Find <link> tags in <head>
  $(
    'link[type="application/rss+xml"], link[type="application/atom+xml"], link[type="application/feed+json"]'
  ).each((_, el) => {
    const href = $(el).attr("href");
    const title = $("title").text() || $(el).attr("title") || "Untitled Feed";
    const type = $(el).attr("type") || "";

    if (href) {
      const absolute = href.startsWith("http") ? href : new URL(href, url).href;
      feeds.push({ href: absolute, title, type, favicon });
    }
  });

  // 2. Scan <a> tags for common RSS paths
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/\/(rss|feed|atom)(\.xml)?(\?.*)?$/i.test(href)) {
      const absolute = href.startsWith("http") ? href : new URL(href, url).href;
      if (!feeds.find((f) => f.href === absolute)) {
        feeds.push({
          href: absolute,
          title: $(el).text().trim() || "RSS Link",
          type: "guessed",
          favicon,
        });
      }
    }
  });

  if (feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URL.");
  return feeds;
}