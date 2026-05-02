import { GOOGLE_CLIENT_ID, json, methodNotAllowed, type NetlifyFunctionEvent, type NetlifyFunctionResponse } from "./_auth.ts";
import type { GoogleConfigResponse } from "../../src/shared/auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "GET") return methodNotAllowed("GET");

    const payload: GoogleConfigResponse = { googleClientId: GOOGLE_CLIENT_ID };
    return json(200, payload);
}
