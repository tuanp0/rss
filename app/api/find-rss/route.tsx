import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (RSS Finder)" },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const feeds: { href: string; title: string; type: string }[] = [];

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
    await Promise.allSettled(
      commonPaths.map(async (path) => {
        const candidate = new URL(path, url).href;
        if (feeds.find((f) => f.href === candidate)) return;
        const r = await fetch(candidate, { method: "HEAD" });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && /xml|rss|atom|feed/i.test(ct)) {
          feeds.push({ href: candidate, title: path, type: ct });
        }
      })
    );

    return NextResponse.json({ feeds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}