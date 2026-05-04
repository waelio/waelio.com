/**
 * GET /api/me
 * Returns current authenticated user info from the session cookie.
 */
import { getCookiesFromRequest, injectEnv, json, methodNotAllowed, verifyToken } from "../_helpers.ts";
import type { CFContext } from "../env.ts";
import type { ApiErrorResponse, MeResponse } from "../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    if (context.request.method !== "GET") return methodNotAllowed("GET");

    const session = verifyToken(getCookiesFromRequest(context.request).session);
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
};
