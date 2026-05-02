import { clearSessionCookie, methodNotAllowed, redirect, type NetlifyFunctionEvent, type NetlifyFunctionResponse } from "./_auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod === "POST") {
        return {
            statusCode: 204,
            headers: {
                "Cache-Control": "no-store",
                "Set-Cookie": clearSessionCookie(),
            },
            body: "",
        };
    }

    if (event.httpMethod !== "GET") return methodNotAllowed("GET, POST");

    return redirect("/", { "Set-Cookie": clearSessionCookie() });
}
