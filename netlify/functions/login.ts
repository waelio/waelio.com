import { json, methodNotAllowed, type NetlifyFunctionEvent, type NetlifyFunctionResponse } from "./_auth.ts";
import type { ApiErrorResponse } from "../../src/shared/auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "POST") return methodNotAllowed("POST");

    return json(410, {
        error: "Password sign-in has been removed. Use Google Sign-In.",
    } satisfies ApiErrorResponse);
}
