export function add(a: number, b: number): number {
  return a + b;
}

// Minimal HTTP server to view results in the browser
// - GET /          -> returns a simple HTML page with a form to add numbers
// - GET /api/add   -> returns { result } JSON given query params a, b
if (import.meta.main) {
  const port = 8000;
  const API_VERSION = "1.0.0";

  const fetchJson = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    return await res.json();
  };

  // Serve static files from /public with simple content-type mapping
  const contentType = (path: string): string => {
    if (path.endsWith(".html")) return "text/html; charset=utf-8";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".js")) return "text/javascript";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".webmanifest")) return "application/manifest+json";
    if (path.endsWith(".svg")) return "image/svg+xml";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".ico")) return "image/x-icon";
    return "application/octet-stream";
  };

  const serveFile = async (filePath: string) => {
    try {
      const data = await Deno.readFile(filePath);
      return new Response(data, { headers: { "content-type": contentType(filePath) } });
    } catch (_) {
      return null;
    }
  };

  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS helpers for API responses
    const cors = (extra: Record<string, string> = {}) => ({
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
      ...extra,
    });
    const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
      new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...cors(headers) } });

    // Preflight for API endpoints
    if (req.method === "OPTIONS" && path.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: cors() });
    }

    // Static site files
    if (path === "/" || path === "/index.html") {
      const res = await serveFile("public/index.html");
      if (res) return res;
    }
    if (path.startsWith("/")) {
      const candidate = "public" + (path === "/" ? "/index.html" : path);
      const res = await serveFile(candidate);
      if (res) return res;
    }

    if (path === "/api/add") {
      const a = Number(url.searchParams.get("a"));
      const b = Number(url.searchParams.get("b"));
      if (Number.isNaN(a) || Number.isNaN(b)) {
        return json({ error: "Invalid query parameters. Use ?a=NUMBER&b=NUMBER" }, 400);
      }
      const result = add(a, b);
      return json({ result });
    }

    if (path === "/api/npm" || path === "/api/pkg") {
      const name = url.searchParams.get("name");
      if (!name) return json({ error: "Missing ?name" }, 400);
      try {
        const meta = await fetchJson(
          `https://registry.npmjs.org/${encodeURIComponent(name)}`,
        );
        const latest = meta["dist-tags"]?.latest;
        const versionMeta = latest ? meta.versions?.[latest] : undefined;
        const downloads = await fetchJson(
          `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)
          }`,
        );
        const payload = {
          name: meta.name || name,
          description: versionMeta?.description || meta.description || "",
          version: latest || meta.version || "",
          homepage: versionMeta?.homepage || meta.homepage || "",
          repository: versionMeta?.repository || meta.repository || null,
          downloads_week: downloads.downloads || 0,
          keywords: Array.isArray(versionMeta?.keywords)
            ? versionMeta?.keywords
            : (Array.isArray(meta.keywords) ? meta.keywords : []),
          license: (typeof versionMeta?.license === "string"
            ? versionMeta.license
            : (typeof meta.license === "string" ? meta.license : "")),
          has_types: Boolean(versionMeta?.types || versionMeta?.typings),
        };
        return json(payload);
      } catch (e) {
        const msg = (e && typeof e === "object" && "message" in e)
          ? (e as Error).message
          : String(e);
        return json({ error: "Failed to load npm data", detail: msg }, 502);
      }
    }

    // GET /api/downloads?name=@scope/pkg&range=last-day|last-week|last-month|last-year
    if (path === "/api/downloads") {
      const name = url.searchParams.get("name");
      const range = (url.searchParams.get("range") || "last-week").toLowerCase();
      if (!name) return json({ error: "Missing ?name" }, 400);
      const allowed = new Set(["last-day", "last-week", "last-month", "last-year"]);
      if (!allowed.has(range as any)) return json({ error: "Invalid ?range" }, 400);
      try {
        const endpoint = range === "last-day" || range === "last-week" || range === "last-month"
          ? `https://api.npmjs.org/downloads/point/${range}/${encodeURIComponent(name)}`
          : `https://api.npmjs.org/downloads/range/${range}/${encodeURIComponent(name)}`;
        const data = await fetchJson(endpoint);
        return json({ name, range, data });
      } catch (e) {
        const msg = (e && typeof e === "object" && "message" in e) ? (e as Error).message : String(e);
        return json({ error: "Failed to load downloads", detail: msg }, 502);
      }
    }

    // GET /api/search?q=vue&size=10
    if (path === "/api/search") {
      const q = url.searchParams.get("q");
      const size = Math.max(1, Math.min(50, Number(url.searchParams.get("size") || 10)));
      if (!q) return json({ error: "Missing ?q" }, 400);
      try {
        const searchUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=${size}`;
        const res = await fetchJson(searchUrl);
        return json(res);
      } catch (e) {
        const msg = (e && typeof e === "object" && "message" in e) ? (e as Error).message : String(e);
        return json({ error: "Failed to search", detail: msg }, 502);
      }
    }

    // Health/version
    if (path === "/api/health") return json({ status: "ok", time: new Date().toISOString(), version: API_VERSION });
    if (path === "/api/version") return json({ version: API_VERSION });

    return new Response("Not Found", { status: 404 });
  };

  console.log(`Server listening on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}
