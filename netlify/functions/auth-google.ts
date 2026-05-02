import {
    ALLOWED_EMAILS,
    GOOGLE_CLIENT_ID,
    createSessionCookie,
    json,
    methodNotAllowed,
    readJsonBody,
    type NetlifyFunctionEvent,
    type NetlifyFunctionResponse,
} from "./_auth.ts";
import type {
    ApiErrorResponse,
    AuthSession,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleTokenInfo,
} from "../../src/shared/auth.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
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

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "POST") return methodNotAllowed("POST");

    if (!GOOGLE_CLIENT_ID) {
        return json(503, { error: "Google sign-in is not configured" } satisfies ApiErrorResponse);
    }

    try {
        const body = parseGoogleAuthRequest(readJsonBody(event));
        const verifyResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
        );

        if (!verifyResponse.ok) {
            return json(401, { error: "Invalid Google token" } satisfies ApiErrorResponse);
        }

        const tokenInfo = parseGoogleTokenInfo(await verifyResponse.json());
        if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
            return json(401, { error: "Token audience mismatch" } satisfies ApiErrorResponse);
        }

        const email = String(tokenInfo.email ?? "").trim().toLowerCase();
        if (!ALLOWED_EMAILS.includes(email)) {
            return json(403, { error: "Email not authorized" } satisfies ApiErrorResponse);
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

        return json(200, payload, {
            "Set-Cookie": createSessionCookie(session),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return json(500, { error: `Google auth failed: ${message}` } satisfies ApiErrorResponse);
    }
}
