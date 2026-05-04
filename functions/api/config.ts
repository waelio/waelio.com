/**
 * GET /api/config
 * Returns the Google Client ID for the frontend.
 */
import { getClientId, injectEnv, json, methodNotAllowed } from "../_helpers.ts";
import type { CFContext } from "../env.ts";
import type { GoogleConfigResponse } from "../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    if (context.request.method !== "GET") return methodNotAllowed("GET");

    const payload: GoogleConfigResponse = { googleClientId: getClientId(context.env) };
    return json(200, payload);
};
