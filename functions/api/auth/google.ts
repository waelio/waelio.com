/**
 * POST /api/auth/google
 * Handles Google OAuth credential verification and session creation.
 */
import {
    createSessionCookie,
    getClientId,
    injectEnv,
    json,
    methodNotAllowed,
    readJsonBody,
} from "../../_helpers.ts";
import type { CFContext } from "../../env.ts";
import type {
    ApiErrorResponse,
    AuthSession,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleTokenInfo,
} from "../../../src/shared/auth.ts";

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
    if (!isRecord(value)) throw new Error("Invalid Google token response");

    const tokenInfo: GoogleTokenInfo = {};
    if (typeof value.aud === "string") tokenInfo.aud = value.aud;
    if (typeof value.email === "string") tokenInfo.email = value.email;
    if (typeof value.name === "string") tokenInfo.name = value.name;
    if (typeof value.picture === "string") tokenInfo.picture = value.picture;
    return tokenInfo;
}

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    if (context.request.method !== "POST") return methodNotAllowed("POST");

    const GOOGLE_CLIENT_ID = getClientId(context.env);
    if (!GOOGLE_CLIENT_ID) {
        return json(503, { error: "Google sign-in is not configured" } satisfies ApiErrorResponse);
    }

    const ALLOWED_EMAILS = (context.env.ALLOWED_EMAILS || "")
        .split(",")
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean);

    try {
        const body = parseGoogleAuthRequest(await readJsonBody(context.request));
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
};
