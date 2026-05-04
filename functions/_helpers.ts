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
