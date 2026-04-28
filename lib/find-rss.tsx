// import * as cheerio from "cheerio";

// const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
// // const CORS_PROXY = "";

// export type RSSFeed = {
//     href: string
//     title: string
//     type: string
// }

// export async function findRSSFeeds(url: string): Promise<RSSFeed[]> {
//     const feeds: RSSFeed[] = [];

//     // Fetch the page HTML via CORS proxy
//     const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    
//     if (!res.ok) throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);

//     const html = await res.text();
//     const $ = cheerio.load(html);

//     // 1. Find <link> tags in <head>
//     $('link[type="application/rss+xml"], link[type="application/atom+xml"], link[type="application/feed+json"]').each((_, el) => {
//         const href = $(el).attr("href");
//         const title = $(el).attr("title") || "Untitled Feed";
//         const type = $(el).attr("type") || "";
//         if (href) {
//             const absolute = href.startsWith("http") ? href : new URL(href, url).href;
//             feeds.push({ href: absolute, title, type });
//         }
//     });

//     // 2. Scan <a> tags for common RSS paths
//     $("a[href]").each((_, el) => {
//         const href = $(el).attr("href") || "";
//         if (/\/(rss|feed|atom)(\.xml)?(\?.*)?$/i.test(href)) {
//             const absolute = href.startsWith("http") ? href : new URL(href, url).href;
//             if (!feeds.find((f) => f.href === absolute)) {
//                 feeds.push({ href: absolute, title: $(el).text().trim() || "RSS Link", type: "guessed" });
//             }
//         }
//     });

//     // 3. Try common well-known paths
//     const commonPaths = ["/feed", "/rss", "/atom.xml", "/feed.xml", "/rss.xml", "/index.xml"];

//     const normalizedUrl = url.replace(/\/$/, "");
//     const urlAlreadyHasCommonPath = commonPaths.some((path) =>
//         new URL(normalizedUrl).pathname.endsWith(path)
//     );

//     if (urlAlreadyHasCommonPath) {
//         const r = await fetch(`${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`, { method: "HEAD" });
//         const ct = r.headers.get("content-type") || "";

//         feeds.push({ href: normalizedUrl, title: new URL(normalizedUrl).pathname, type: ct });
        
//     } else {
//         await Promise.allSettled(
//             commonPaths.map(async (path) => {
//                 const candidate = new URL(path, normalizedUrl).href;
//                 if (feeds.find((f) => f.href === candidate)) return;
//                 const r = await fetch(`${CORS_PROXY}${encodeURIComponent(candidate)}`, { method: "HEAD" });
//                 const ct = r.headers.get("content-type") || "";

//                 if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
//                     feeds.push({ href: candidate, title: path, type: ct });
//                 }
//             })
//         );
//     }

//     if (feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URL.");
//     return feeds;
// }

import * as cheerio from "cheerio";

const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
// const CORS_PROXY = "";

export type RSSFeed = {
    href: string
    title: string
    type: string
}

export async function findRSSFeeds(url: string): Promise<RSSFeed[]> {
    const feeds: RSSFeed[] = [];

    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Find <link> tags in <head>
    $('link[type="application/rss+xml"], link[type="application/atom+xml"], link[type="application/feed+json"]').each((_, el) => {
        const href = $(el).attr("href");
        const title = $(el).attr("title") || "Untitled Feed";
        const type = $(el).attr("type") || "";

        if (href) {
            const absolute = href.startsWith("http") ? href : new URL(href, url).href;
            feeds.push({ href: absolute, title, type });
        }
    });

    // 2. Scan <a> tags for common RSS paths
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (/\/(rss|feed|atom)(\.xml)?(\?.*)?$/i.test(href)) {
            const absolute = href.startsWith("http") ? href : new URL(href, url).href;
            if (!feeds.find((f) => f.href === absolute)) {
                feeds.push({ href: absolute, title: $(el).text().trim() || "RSS Link", type: "guessed" });
            }
        }
    });

    // 3. Try common well-known paths
    const commonPaths = ["/feed", "/rss", "/atom.xml", "/feed.xml", "/rss.xml", "/index.xml"];

    const normalizedUrl = url.replace(/\/$/, "");
    const urlAlreadyHasCommonPath = commonPaths.some((path) =>
        new URL(normalizedUrl).pathname.endsWith(path)
    );

    if (urlAlreadyHasCommonPath) {
        const r = await fetch(`${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`);
        const ct = r.headers.get("content-type") || "";

        if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
            feeds.push({ href: normalizedUrl, title: new URL(normalizedUrl).pathname, type: ct });
        }
    } else {
        await Promise.allSettled(
            commonPaths.map(async (path) => {
                const candidate = new URL(path, normalizedUrl).href;
                if (feeds.find((f) => f.href === candidate)) return;
                const r = await fetch(`${CORS_PROXY}${encodeURIComponent(candidate)}`);
                const ct = r.headers.get("content-type") || "";

                if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
                    feeds.push({ href: candidate, title: path, type: ct });
                }
            })
        );
    }

    if (feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URL.");
    return feeds;
}