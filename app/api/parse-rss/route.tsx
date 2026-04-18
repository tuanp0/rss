// app/api/parse-feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const extractFirstImage = (html: string): string => {
  const $ = cheerio.load(html);
  return $("img").first().attr("src") || "";
};

const getRawAttr = (xml: string, tag: string, attr: string): string => {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
};

export async function GET(req: NextRequest) {
  const feedUrl = req.nextUrl.searchParams.get("url");
  if (!feedUrl) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (RSS Parser)" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch feed: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const posts: {
      title: string;
      postUrl: string;
      publishedAt: string;
      shortDesc: string;
      content: string;
      thumbnail: string;
    }[] = [];

    // RSS 2.0
    $("item").each((_, el) => {
      const title = $(el).find("title").first().text().trim();
      const postUrl =
        $(el).find("link").first().text().trim() ||
        $(el).find("link").first().next().text().trim() ||
        $(el).find("guid").first().text().trim();
      const publishedAt = $(el).find("pubDate").first().text().trim();
      const shortDesc = $(el).find("description").first().html()?.trim() ?? "";

      const rawEl = $.html(el);

      // Extract content:encoded via regex (cheerio struggles with namespaced tags)
      const contentEncoded = (() => {
        const match = rawEl.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
        return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() : "";
      })();

      const bodyContent = $(el).find("body").first().html()?.trim() ?? "";

      const content = contentEncoded || bodyContent || shortDesc;

      const thumbnail =
        getRawAttr(rawEl, "media:thumbnail", "url") ||
        getRawAttr(rawEl, "media:content", "url") ||
        $(el).find("enclosure[type^='image']").attr("url") ||
        extractFirstImage(content) ||
        extractFirstImage(shortDesc) ||
        "";

      if (title && postUrl) posts.push({ title, postUrl, publishedAt, shortDesc, content, thumbnail });
    });

    // Atom
    if (posts.length === 0) {
      $("entry").each((_, el) => {
        const title = $(el).find("title").first().text().trim();
        const postUrl =
          $(el).find("link").attr("href")?.trim() ||
          $(el).find("id").first().text().trim();
        const publishedAt = (
          $(el).find("published").first().text() ||
          $(el).find("updated").first().text()
        ).trim();

        const content =
          $(el).find("content").first().html()?.trim() ||
          $(el).find("summary").first().html()?.trim() ||
          "";
        const shortDesc =
          $(el).find("summary").first().html()?.trim() ||
          content.slice(0, 300);

        const rawEl = $.html(el);
        const thumbnail =
          getRawAttr(rawEl, "media:thumbnail", "url") ||
          getRawAttr(rawEl, "media:content", "url") ||
          extractFirstImage(content) ||
          extractFirstImage(shortDesc) ||
          "";

        if (title && postUrl) posts.push({ title, postUrl, publishedAt, shortDesc, content, thumbnail });
      });
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "No posts found — feed may not be valid RSS or Atom" },
        { status: 422 }
      );
    }

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}