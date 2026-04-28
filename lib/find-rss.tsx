import * as cheerio from "cheerio";

const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
// const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

export type RSSFeed = {
    href: string
    title: string
    type: string
    favicon: string
}

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

async function extractFaviconBase64($: cheerio.CheerioAPI, baseUrl: string): Promise<string> {
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

export async function findRSSFeeds(url: string): Promise<RSSFeed[]> {
    const feeds: RSSFeed[] = [];

    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const favicon = await extractFaviconBase64($, url);

    // 1. Find <link> tags in <head>
    $('link[type="application/rss+xml"], link[type="application/atom+xml"], link[type="application/feed+json"]').each((_, el) => {
        const href = $(el).attr("href");
        const title = $(el).attr("title") || "Untitled Feed";
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
                feeds.push({ href: absolute, title: $(el).text().trim() || "RSS Link", type: "guessed", favicon });
            }
        }
    });

    // 3. Try common well-known paths
    // const commonPaths = ["/feed", "/rss", "/atom.xml", "/feed.xml", "/rss.xml", "/index.xml"];

    // const normalizedUrl = url.replace(/\/$/, "");
    // const urlAlreadyHasCommonPath = commonPaths.some((path) =>
    //     new URL(normalizedUrl).pathname.endsWith(path)
    // );

    // if (urlAlreadyHasCommonPath) {
    //     const r = await fetch(`${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`);
    //     const ct = r.headers.get("content-type") || "";

    //     if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
    //         feeds.push({ href: normalizedUrl, title: new URL(normalizedUrl).pathname, type: ct, favicon });
    //     }
    // } else {
    //     await Promise.allSettled(
    //         commonPaths.map(async (path) => {
    //             const candidate = new URL(path, normalizedUrl).href;
    //             if (feeds.find((f) => f.href === candidate)) return;
    //             const r = await fetch(`${CORS_PROXY}${encodeURIComponent(candidate)}`);
    //             const ct = r.headers.get("content-type") || "";

    //             if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
    //                 feeds.push({ href: candidate, title: path, type: ct, favicon });
    //             }
    //         })
    //     );
    // }

    if (feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URL.");
    return feeds;
}