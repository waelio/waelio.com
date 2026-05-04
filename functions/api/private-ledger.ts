/**
 * GET /api/private-ledger
 * Returns the full ledger view for the authenticated partner.
 */
import { getCookiesFromRequest, injectEnv, json, methodNotAllowed, verifyToken } from "../_helpers.ts";
import type { CFContext } from "../env.ts";
import { getLedgerError, getLedgerView, setKVNamespace } from "../../private-ledger-store.ts";
import type { ApiErrorResponse } from "../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    setKVNamespace(context.env.WAELIO_PRIVATE);

    if (context.request.method !== "GET") return methodNotAllowed("GET");

    const session = verifyToken(getCookiesFromRequest(context.request).session);

    try {
        const payload = await getLedgerView(session, context.env.ALLOWED_EMAILS);
        return json(200, payload);
    } catch (error) {
        const failure = getLedgerError(error);
        return json(failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
    }
};
