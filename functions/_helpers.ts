/**
 * Shared helpers for Cloudflare Pages Functions.
 * Uses Web-standard Request/Response primitives for auth and API responses.
 */
import {
    clearSessionCookie,
    createSessionCookie,
    createToken,
    getAllowedEmails,
    getGoogleClientId,
    parseCookies,
    TOKEN_MAX_AGE,
    verifyToken,
} from "../auth.ts";
import type { Env, CFContext } from "./env.ts";

/* ── re-exports ─────────────────────────────────────────────── */
export {
    TOKEN_MAX_AGE,
    clearSessionCookie,
    createSessionCookie,
    createToken,
    parseCookies,
    verifyToken,
};

export type { Env, CFContext };

/* ── env helpers ────────────────────────────────────────────── */

/**
 * Initialize process.env from Cloudflare env bindings so that
 * existing auth.ts / private-ledger-store.ts code (which reads
 * process.env) works unchanged.
 */
export function injectEnv(env: Env): void {
    if (env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET;
    if (env.LEDGER_SECRET) process.env.LEDGER_SECRET = env.LEDGER_SECRET;
    if (env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    if (env.ALLOWED_EMAILS) process.env.ALLOWED_EMAILS = env.ALLOWED_EMAILS;
    if (env.AGENT_API_BASE_URL) process.env.AGENT_API_BASE_URL = env.AGENT_API_BASE_URL;
    if (env.AGENT_APP_NAME) process.env.AGENT_APP_NAME = env.AGENT_APP_NAME;
    if (env.R2_ACCOUNT_ID) process.env.R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
    if (env.R2_BUCKET_NAME) process.env.R2_BUCKET_NAME = env.R2_BUCKET_NAME;
    if (env.R2_ACCESS_KEY_ID) process.env.R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
    if (env.R2_SECRET_ACCESS_KEY) process.env.R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
    if (env.R2_ENDPOINT) process.env.R2_ENDPOINT = env.R2_ENDPOINT;

    // Signal that we're running in Cloudflare (used by private-ledger-store)
    process.env.CLOUDFLARE = "1";
}

/**
 * Resolve the Google Client ID from the Cloudflare env.
 */
export function getClientId(env: Env): string {
    return getGoogleClientId();
}

/**
 * Resolve the allowed email list from the Cloudflare env.
 */
export function getAllowed(env: Env): string[] {
    return getAllowedEmails(env.ALLOWED_EMAILS);
}

export function getAgentApiBaseUrl(env: Env): string {
    return (env.AGENT_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
}

export function getAgentAppName(env: Env): string {
    return (env.AGENT_APP_NAME ?? "").trim() || "Agent";
}

/* ── request helpers ────────────────────────────────────────── */

export async function readJsonBody(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

export function getCookiesFromRequest(request: Request): Record<string, string> {
    return parseCookies(request.headers.get("cookie") ?? "");
}

/* ── response helpers ───────────────────────────────────────── */

export function json(
    statusCode: number,
    payload: unknown,
    headers: Record<string, string> = {},
): Response {
    return new Response(JSON.stringify(payload), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            ...headers,
        },
    });
}

export function redirect(
    location: string,
    headers: Record<string, string> = {},
): Response {
    return new Response(null, {
        status: 302,
        headers: {
            Location: location,
            "Cache-Control": "no-store",
            ...headers,
        },
    });
}

export function methodNotAllowed(allow: string): Response {
    return json(405, { error: "Method not allowed" }, { Allow: allow });
}
