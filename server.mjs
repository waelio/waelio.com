import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, timingSafeEqual } from "node:crypto";
import { resolveGoogleClientId } from "./google-client-id.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 3333;
const PUBLIC_DIR = join(__dirname, "public");

// ── .env loader (zero dependencies) ────────────────────

try {
  const raw = readFileSync(join(__dirname, ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  /* .env not found — use process env */
}

// ── auth config ─────────────────────────────────────────

const AUTH_SECRET = process.env.AUTH_SECRET || "change-me-in-production";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const GOOGLE_CLIENT_ID = resolveGoogleClientId(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ── auth helpers ────────────────────────────────────────

function encodeSession(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeSession(value) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function createToken(user) {
  const payload = encodeSession({
    user,
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
  });
  const sig = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  const session = decodeSession(payload);
  if (!session || typeof session.user !== "string") return null;
  if (typeof session.exp !== "number" || session.exp < Date.now() / 1000)
    return null;
  return session.user;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.split("=");
    if (key) cookies[key.trim()] = rest.join("=").trim();
  }
  return cookies;
}

function getAuthUser(req) {
  return verifyToken(parseCookies(req).session);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        resolve(null);
      }
    });
    req.on("error", reject);
  });
}

// ── original helpers ────────────────────────────────────

function add(a, b) {
  return a + b;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function serveStatic(pathname, res) {
  const safePath = pathname.replace(/\.\./g, "");
  const filePath = join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

// ── request handler ─────────────────────────────────────

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // ── AUTH: POST /api/login (deprecated) ───────────────
  if (path === "/api/login" && req.method === "POST") {
    res.writeHead(410, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        error: "Password sign-in has been removed. Use Google Sign-In.",
      }),
    );
  }

  // ── AUTH: POST /api/auth/google ────────────────────────
  if (path === "/api/auth/google" && req.method === "POST") {
    if (!GOOGLE_CLIENT_ID) {
      res.writeHead(503, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Google sign-in is not configured" }),
      );
    }
    const body = await readBody(req);
    if (!body || !body.credential) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing credential" }));
    }
    try {
      // Verify token with Google
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
      );
      if (!verifyRes.ok) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid Google token" }));
      }
      const payload = await verifyRes.json();

      // Check audience matches our client ID
      if (payload.aud !== GOOGLE_CLIENT_ID) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Token audience mismatch" }));
      }

      // Check email is in allowed list
      const email = (payload.email || "").toLowerCase();
      if (!ALLOWED_EMAILS.includes(email)) {
        res.writeHead(403, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email not authorized" }));
      }

      // Create session
      const sessionUser = payload.name || email;
      const token = createToken(sessionUser);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `session=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Strict`,
      });
      return res.end(JSON.stringify({ ok: true, user: sessionUser }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: `Google auth failed: ${msg}` }));
    }
  }

  // ── CONFIG: GET /api/config ────────────────────────────
  if (path === "/api/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ googleClientId: GOOGLE_CLIENT_ID }));
  }

  // ── AUTH: GET /api/logout ─────────────────────────────
  if (path === "/api/logout") {
    res.writeHead(302, {
      Location: "/",
      "Set-Cookie": "session=; HttpOnly; Path=/; Max-Age=0",
    });
    return res.end();
  }

  // ── AUTH: GET /api/me ─────────────────────────────────
  if (path === "/api/me") {
    const user = getAuthUser(req);
    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authenticated" }));
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ user }));
  }

  // ── GUARD: /private requires auth ─────────────────────
  if (path === "/private" || path === "/private.html") {
    const user = getAuthUser(req);
    if (!user) {
      res.writeHead(302, { Location: "/login.html" });
      return res.end();
    }
    // Authenticated — fall through to serve private.html
  }

  // ── API: /api/add ─────────────────────────────────────
  if (path === "/api/add") {
    const a = Number(url.searchParams.get("a"));
    const b = Number(url.searchParams.get("b"));
    if (Number.isNaN(a) || Number.isNaN(b)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Invalid query parameters. Use ?a=NUMBER&b=NUMBER");
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ result: add(a, b) }));
  }

  // ── API: /api/npm ─────────────────────────────────────
  if (path === "/api/npm") {
    const name = url.searchParams.get("name");
    if (!name) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Missing ?name");
    }
    try {
      const meta = await fetchJson(
        `https://registry.npmjs.org/${encodeURIComponent(name)}`,
      );
      const latest = meta["dist-tags"]?.latest;
      const versionMeta = latest ? meta.versions?.[latest] : undefined;
      const downloads = await fetchJson(
        `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`,
      );
      const payload = {
        name: meta.name || name,
        description: versionMeta?.description || meta.description || "",
        version: latest || meta.version || "",
        homepage: versionMeta?.homepage || meta.homepage || "",
        repository: versionMeta?.repository || meta.repository || null,
        downloads_week: downloads.downloads || 0,
        keywords: Array.isArray(versionMeta?.keywords)
          ? versionMeta.keywords
          : Array.isArray(meta.keywords)
            ? meta.keywords
            : [],
        license:
          typeof versionMeta?.license === "string"
            ? versionMeta.license
            : typeof meta.license === "string"
              ? meta.license
              : "",
        has_types: Boolean(versionMeta?.types || versionMeta?.typings),
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(payload));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      res.writeHead(502, { "Content-Type": "text/plain" });
      return res.end(`Failed to load npm data: ${msg}`);
    }
  }

  // ── Static files ──────────────────────────────────────
  const served = await serveStatic(path, res);
  if (served) return;

  // Fallback → index.html
  const fallback = await serveStatic("/", res);
  if (fallback) return;

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, "127.0.0.1");
