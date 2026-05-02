import { json, methodNotAllowed, parseCookies, verifyToken, type NetlifyFunctionEvent, type NetlifyFunctionResponse } from "./_auth.ts";
import type { ApiErrorResponse, MeResponse } from "../../src/shared/auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "GET") return methodNotAllowed("GET");

    const session = verifyToken(parseCookies(event.headers).session);
    if (!session) {
        return json(401, { error: "Not authenticated" } satisfies ApiErrorResponse);
    }

    const payload: MeResponse = {
        user: session.name,
        name: session.name,
        email: session.email,
        picture: session.picture || null,
    };
    return json(200, payload);
}
