export function add(a: number, b: number): number {
  return a + b;
}

// Minimal HTTP server to view results in the browser
// - GET /          -> returns a simple HTML page with a form to add numbers
// - GET /api/add   -> returns { result } JSON given query params a, b
if (import.meta.main) {
  const port = 8000;

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
        return new Response(
          "Invalid query parameters. Use ?a=NUMBER&b=NUMBER",
          { status: 400 },
        );
      }
      const result = add(a, b);
      return new Response(JSON.stringify({ result }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (path === "/api/npm") {
      const name = url.searchParams.get("name");
      if (!name) return new Response("Missing ?name", { status: 400 });
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
        return new Response(JSON.stringify(payload), {
          headers: { "content-type": "application/json" },
        });
      } catch (e) {
        const msg = (e && typeof e === "object" && "message" in e)
          ? (e as Error).message
          : String(e);
        return new Response(`Failed to load npm data: ${msg}`, { status: 502 });
      }
    }

    return new Response("Not Found", { status: 404 });
  };

  console.log(`Server listening on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}
