/**
 * GET /api/agent/config
 * Returns private agent runtime configuration for authenticated users.
 */
import {
    getAgentApiBaseUrl,
    getAgentAppName,
    getCookiesFromRequest,
    injectEnv,
    json,
    methodNotAllowed,
    verifyToken,
} from "../../_helpers.ts";
import type { CFContext } from "../../env.ts";
import type { ApiErrorResponse } from "../../../src/shared/auth.ts";
import type { AgentConfigResponse } from "../../../src/shared/agent.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    if (context.request.method !== "GET") return methodNotAllowed("GET");

    const session = verifyToken(getCookiesFromRequest(context.request).session);
    if (!session) {
        return json(401, { error: "Not authenticated" } satisfies ApiErrorResponse);
    }

    const payload: AgentConfigResponse = {
        apiBaseUrl: getAgentApiBaseUrl(context.env),
        appName: getAgentAppName(context.env),
    };
    return json(200, payload);
};