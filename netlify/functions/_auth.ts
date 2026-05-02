import {
    clearSessionCookie,
    createSessionCookie,
    createToken,
    getAllowedEmails,
    getGoogleClientId,
    loadEnvFile,
    parseCookies,
    TOKEN_MAX_AGE,
    verifyToken,
} from "../../auth.ts";

loadEnvFile(process.cwd());

export interface NetlifyFunctionEvent {
    httpMethod: string;
    body: string | null;
    headers: Record<string, string | undefined>;
}

export interface NetlifyFunctionResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}

export const GOOGLE_CLIENT_ID = getGoogleClientId();
export const ALLOWED_EMAILS = getAllowedEmails();
export {
    TOKEN_MAX_AGE,
    clearSessionCookie,
    createSessionCookie,
    createToken,
    parseCookies,
    verifyToken,
};

export function readJsonBody(event: NetlifyFunctionEvent): unknown {
    if (!event.body) return null;

    try {
        return JSON.parse(event.body) as unknown;
    } catch {
        return null;
    }
}

export function json(
    statusCode: number,
    payload: unknown,
    headers: Record<string, string> = {},
): NetlifyFunctionResponse {
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

export function redirect(location: string, headers: Record<string, string> = {}): NetlifyFunctionResponse {
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

export function methodNotAllowed(allow: string): NetlifyFunctionResponse {
    return json(405, { error: "Method not allowed" }, { Allow: allow });
}
