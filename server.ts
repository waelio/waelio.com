import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
    clearSessionCookie,
    createSessionCookie,
    getAllowedEmails,
    getGoogleClientId,
    loadEnvFile,
    parseCookies,
    verifyToken,
} from "./auth.ts";
import { getLedgerError, getLedgerView, reviewLedgerEntry, submitLedgerEntry } from "./private-ledger-store.ts";
import type {
    ApiErrorResponse,
    AuthSession,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleConfigResponse,
    GoogleTokenInfo,
    MeResponse,
} from "./src/shared/auth.ts";

const ROOT_DIR = fileURLToPath(new URL(".", import.meta.url));
loadEnvFile(ROOT_DIR);

const PORT = Number(process.env.PORT) || 3333;
const PUBLIC_DIR = join(ROOT_DIR, "public");
const GOOGLE_CLIENT_ID = getGoogleClientId();
const ALLOWED_EMAILS = getAllowedEmails();

const MIME: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function sendJson(
    res: ServerResponse,
    statusCode: number,
    payload: unknown,
    headers: Record<string, string> = {},
): void {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers,
    });
    res.end(JSON.stringify(payload));
}

function sendText(res: ServerResponse, statusCode: number, message: string): void {
    res.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end(message);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
    return await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        req.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");
            if (!raw) {
                resolve(null);
                return;
            }

            try {
                resolve(JSON.parse(raw) as unknown);
            } catch {
                resolve(null);
            }
        });
        req.on("error", reject);
    });
}

function getAuthSession(req: IncomingMessage): AuthSession | null {
    return verifyToken(parseCookies(req.headers).session);
}

function parseGoogleAuthRequest(value: unknown): GoogleAuthRequest {
    if (!isRecord(value) || typeof value.credential !== "string" || !value.credential.trim()) {
        throw new Error("Missing credential");
    }

    return { credential: value.credential };
}

function parseGoogleTokenInfo(value: unknown): GoogleTokenInfo {
    if (!isRecord(value)) {
        throw new Error("Invalid Google token response");
    }

    const tokenInfo: GoogleTokenInfo = {};
    if (typeof value.aud === "string") tokenInfo.aud = value.aud;
    if (typeof value.email === "string") tokenInfo.email = value.email;
    if (typeof value.name === "string") tokenInfo.name = value.name;
    if (typeof value.picture === "string") tokenInfo.picture = value.picture;
    return tokenInfo;
}

function buildMeResponse(session: AuthSession): MeResponse {
    return {
        user: session.name,
        name: session.name,
        email: session.email,
        picture: session.picture || null,
    };
}

function add(a: number, b: number): number {
    return a + b;
}

async function fetchJson(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Upstream ${response.status}`);
    }

    return await response.json();
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === "string" ? value : undefined;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
    const value = record[key];
    return isRecord(value) ? value : undefined;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        return undefined;
    }

    return value;
}

function buildNpmPayload(name: string, metaValue: unknown, downloadsValue: unknown): Record<string, unknown> {
    const meta = isRecord(metaValue) ? metaValue : {};
    const downloads = isRecord(downloadsValue) ? downloadsValue : {};
    const distTags = readRecord(meta, "dist-tags");
    const versions = readRecord(meta, "versions");
    const latest = distTags ? readString(distTags, "latest") : undefined;
    const versionMeta = latest && versions ? readRecord(versions, latest) : undefined;
    const versionKeywords = versionMeta ? readStringArray(versionMeta, "keywords") : undefined;
    const metaKeywords = readStringArray(meta, "keywords");
    const description = versionMeta ? readString(versionMeta, "description") : undefined;
    const homepage = versionMeta ? readString(versionMeta, "homepage") : undefined;
    const versionLicense = versionMeta ? readString(versionMeta, "license") : undefined;
    const repository = versionMeta?.repository ?? meta.repository ?? null;

    return {
        name: readString(meta, "name") || name,
        description: description || readString(meta, "description") || "",
        version: latest || readString(meta, "version") || "",
        homepage: homepage || readString(meta, "homepage") || "",
        repository,
        downloads_week: Number(downloads.downloads ?? 0) || 0,
        keywords: versionKeywords || metaKeywords || [],
        license: versionLicense || readString(meta, "license") || "",
        has_types: Boolean(versionMeta?.types || versionMeta?.typings),
    };
}

async function serveStatic(pathname: string, res: ServerResponse): Promise<boolean> {
    const safePath = pathname.replace(/\.\./g, "");
    const filePath = join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);

    try {
        const data = await readFile(filePath);
        const extension = extname(filePath);
        res.writeHead(200, {
            "Content-Type": MIME[extension] || "application/octet-stream",
        });
        res.end(data);
        return true;
    } catch {
        return false;
    }
}

const server = createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    const path = requestUrl.pathname;

    if (path === "/api/login" && req.method === "POST") {
        const payload: ApiErrorResponse = {
            error: "Password sign-in has been removed. Use Google Sign-In.",
        };
        sendJson(res, 410, payload);
        return;
    }

    if (path === "/api/auth/google" && req.method === "POST") {
        if (!GOOGLE_CLIENT_ID) {
            sendJson(res, 503, { error: "Google sign-in is not configured" } satisfies ApiErrorResponse);
            return;
        }

        try {
            const body = parseGoogleAuthRequest(await readBody(req));
            const verifyResponse = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
            );

            if (!verifyResponse.ok) {
                sendJson(res, 401, { error: "Invalid Google token" } satisfies ApiErrorResponse);
                return;
            }

            const tokenInfo = parseGoogleTokenInfo(await verifyResponse.json());
            if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
                sendJson(res, 401, { error: "Token audience mismatch" } satisfies ApiErrorResponse);
                return;
            }

            const email = String(tokenInfo.email ?? "").trim().toLowerCase();
            if (!ALLOWED_EMAILS.includes(email)) {
                sendJson(res, 403, { error: "Email not authorized" } satisfies ApiErrorResponse);
                return;
            }

            const session: AuthSession = {
                email,
                name: tokenInfo.name?.trim() || email,
                picture: tokenInfo.picture?.trim() || "",
            };
            const payload: GoogleAuthSuccessResponse = {
                ok: true,
                user: session.name,
                email,
            };
            sendJson(res, 200, payload, {
                "Set-Cookie": createSessionCookie(session),
            });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            sendJson(res, 500, { error: `Google auth failed: ${message}` } satisfies ApiErrorResponse);
            return;
        }
    }

    if (path === "/api/config") {
        const payload: GoogleConfigResponse = { googleClientId: GOOGLE_CLIENT_ID };
        sendJson(res, 200, payload);
        return;
    }

    if (path === "/api/logout") {
        if (req.method === "POST") {
            res.writeHead(204, {
                "Set-Cookie": clearSessionCookie(),
                "Cache-Control": "no-store",
            });
            res.end();
            return;
        }

        if (!req.method || req.method === "GET") {
            res.writeHead(302, {
                Location: "/",
                "Set-Cookie": clearSessionCookie(),
                "Cache-Control": "no-store",
            });
            res.end();
            return;
        }

        res.writeHead(405, {
            Allow: "GET, POST",
            "Cache-Control": "no-store",
        });
        res.end();
        return;
    }

    if (path === "/api/me") {
        const session = getAuthSession(req);
        if (!session) {
            sendJson(res, 401, { error: "Not authenticated" } satisfies ApiErrorResponse);
            return;
        }

        sendJson(res, 200, buildMeResponse(session));
        return;
    }

    if (path === "/api/private-ledger" && req.method === "GET") {
        try {
            const payload = await getLedgerView(getAuthSession(req), ALLOWED_EMAILS);
            sendJson(res, 200, payload);
        } catch (error) {
            const failure = getLedgerError(error);
            sendJson(res, failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
        }
        return;
    }

    if (path === "/api/private-ledger/entries" && req.method === "POST") {
        try {
            const payload = await submitLedgerEntry(getAuthSession(req), ALLOWED_EMAILS, await readBody(req));
            sendJson(res, 200, payload);
        } catch (error) {
            const failure = getLedgerError(error);
            sendJson(res, failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
        }
        return;
    }

    if (path === "/api/private-ledger/review" && req.method === "POST") {
        try {
            const payload = await reviewLedgerEntry(getAuthSession(req), ALLOWED_EMAILS, await readBody(req));
            sendJson(res, 200, payload);
        } catch (error) {
            const failure = getLedgerError(error);
            sendJson(res, failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
        }
        return;
    }

    if (path === "/private" || path === "/private.html") {
        if (!getAuthSession(req)) {
            res.writeHead(302, { Location: "/login.html", "Cache-Control": "no-store" });
            res.end();
            return;
        }
    }

    if (path === "/api/add") {
        const a = Number(requestUrl.searchParams.get("a"));
        const b = Number(requestUrl.searchParams.get("b"));
        if (Number.isNaN(a) || Number.isNaN(b)) {
            sendText(res, 400, "Invalid query parameters. Use ?a=NUMBER&b=NUMBER");
            return;
        }

        sendJson(res, 200, { result: add(a, b) });
        return;
    }

    if (path === "/api/npm") {
        const name = requestUrl.searchParams.get("name");
        if (!name) {
            sendText(res, 400, "Missing ?name");
            return;
        }

        try {
            const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
            const downloads = await fetchJson(
                `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`,
            );
            sendJson(res, 200, buildNpmPayload(name, meta, downloads));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            sendText(res, 502, `Failed to load npm data: ${message}`);
        }
        return;
    }

    if (await serveStatic(path, res)) {
        return;
    }

    if (await serveStatic("/", res)) {
        return;
    }

    sendText(res, 404, "Not Found");
});

server.listen(PORT, "127.0.0.1");
