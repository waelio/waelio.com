import { clearSessionCookie, methodNotAllowed, redirect, type NetlifyFunctionEvent, type NetlifyFunctionResponse } from "./_auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "GET") return methodNotAllowed("GET");

    return redirect("/", { "Set-Cookie": clearSessionCookie() });
}
