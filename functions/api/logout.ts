/**
 * GET|POST /api/logout
 * Clears the session cookie.
 */
import { clearSessionCookie, injectEnv, methodNotAllowed, redirect } from "../_helpers.ts";
import type { CFContext } from "../env.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    const method = context.request.method;

    if (method === "POST") {
        return new Response(null, {
            status: 204,
            headers: {
                "Cache-Control": "no-store",
                "Set-Cookie": clearSessionCookie(),
            },
        });
    }

    if (method !== "GET") return methodNotAllowed("GET, POST");

    return redirect("/", { "Set-Cookie": clearSessionCookie() });
};
