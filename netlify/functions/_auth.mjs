import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT_DIR = process.cwd();

try {
  const raw = readFileSync(join(ROOT_DIR, ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // Netlify production provides env vars directly.
}

const AUTH_SECRET = process.env.AUTH_SECRET || "change-me-in-production";
export const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
export const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || "").trim();
export const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

export function createToken(user) {
  const payload = encodeSession({
    user,
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
  });
  const sig = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
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

export function parseCookies(headers = {}) {
  const header = headers.cookie || headers.Cookie || "";
  const cookies = {};

  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.split("=");
    if (!key) continue;
    cookies[key.trim()] = rest.join("=").trim();
  }

  return cookies;
}

export function readJsonBody(event) {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

function secureCookieAttribute() {
  return process.env.CONTEXT ? "; Secure" : "";
}

export function createSessionCookie(user) {
  return `session=${createToken(user)}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Strict${secureCookieAttribute()}`;
}

export function clearSessionCookie() {
  return `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secureCookieAttribute()}`;
}

export function json(statusCode, payload, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
    body: JSON.stringify(payload),
  };
}

export function redirect(location, headers = {}) {
  return {
    statusCode: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      ...headers,
    },
    body: "",
  };
}

export function methodNotAllowed(allow) {
  return json(405, { error: "Method not allowed" }, { Allow: allow });
}
