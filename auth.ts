import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveGoogleClientId } from "./google-client-id.ts";
import type { AuthSession, SessionTokenPayload } from "./src/shared/auth.ts";

const DEFAULT_AUTH_SECRET = "change-me-in-production";
export const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

interface CookieSource {
    cookie?: string | undefined;
    Cookie?: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function stripWrappingQuotes(value: string): string {
    return value.replace(/^['"]|['"]$/g, "");
}

export function loadEnvFile(rootDir: string): void {
    try {
        const raw = readFileSync(join(rootDir, ".env"), "utf8");
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;

            const equalsIndex = trimmed.indexOf("=");
            if (equalsIndex === -1) continue;

            const key = trimmed.slice(0, equalsIndex).trim();
            const value = stripWrappingQuotes(trimmed.slice(equalsIndex + 1).trim());
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch {
        // Ignore missing local env files.
    }
}

export function getAuthSecret(): string {
    return process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

export function getGoogleClientId(): string {
    return resolveGoogleClientId(process.env.GOOGLE_CLIENT_ID);
}

export function getAllowedEmails(rawValue = process.env.ALLOWED_EMAILS ?? ""): string[] {
    return rawValue
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function encodeSession(value: SessionTokenPayload): string {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeSession(value: string): unknown {
    try {
        return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    } catch {
        return null;
    }
}

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
    if (!isRecord(value)) return false;

    return (
        typeof value.email === "string"
        && typeof value.name === "string"
        && typeof value.picture === "string"
        && typeof value.exp === "number"
    );
}

export function createToken(session: AuthSession): string {
    const payload: SessionTokenPayload = {
        email: session.email.trim().toLowerCase(),
        name: session.name.trim() || session.email.trim().toLowerCase(),
        picture: session.picture.trim(),
        exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
    };

    const encodedPayload = encodeSession(payload);
    const signature = createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("hex");
    return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string | null | undefined): AuthSession | null {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const payload = parts[0];
    const signature = parts[1];
    if (!payload || !signature) return null;

    const expectedSignature = createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

    const decoded = decodeSession(payload);
    if (!isSessionTokenPayload(decoded)) return null;
    if (decoded.exp < Date.now() / 1000) return null;

    const email = decoded.email.trim().toLowerCase();
    if (!email) return null;

    return {
        email,
        name: decoded.name.trim() || email,
        picture: decoded.picture.trim(),
    };
}

export function parseCookies(source: CookieSource | string | undefined): Record<string, string> {
    const header = typeof source === "string"
        ? source
        : source?.cookie ?? source?.Cookie ?? "";

    const cookies: Record<string, string> = {};
    for (const pair of header.split(";")) {
        const [rawKey, ...rawValueParts] = pair.split("=");
        const key = rawKey?.trim();
        if (!key) continue;

        cookies[key] = rawValueParts.join("=").trim();
    }

    return cookies;
}

function secureCookieAttribute(): string {
    return process.env.CONTEXT ? "; Secure" : "";
}

export function createSessionCookie(session: AuthSession): string {
    return `session=${createToken(session)}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Strict${secureCookieAttribute()}`;
}

export function clearSessionCookie(): string {
    return `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secureCookieAttribute()}`;
}
