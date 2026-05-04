/**
 * POST /api/login
 * Legacy password login — returns 410 Gone.
 */
import { injectEnv, json, methodNotAllowed } from "../_helpers.ts";
import type { CFContext } from "../env.ts";
import type { ApiErrorResponse } from "../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    if (context.request.method !== "POST") return methodNotAllowed("POST");

    return json(410, {
        error: "Password sign-in has been removed. Use Google Sign-In.",
    } satisfies ApiErrorResponse);
};
