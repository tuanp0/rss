// lib/proxy.ts
const CORS_PROXIES = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export async function fetchWithProxy(url: string): Promise<string> {
    for (const proxy of CORS_PROXIES) {
        try {
            const res = await fetch(proxy(url));
            if (res.ok) return await res.text();
        } catch {
            // try next proxy
        }
    }
    throw new Error("Impossible de récupérer la page (tous les proxies ont échoué).");
}

export async function headWithProxy(url: string): Promise<string | null> {
    for (const proxy of CORS_PROXIES) {
        try {
            const res = await fetch(proxy(url), { method: "HEAD" });
            if (res.ok) return res.headers.get("content-type");
        } catch {
            // try next proxy
        }
    }
    return null;
}