/**
 * POST /api/private-ledger/review
 * Approve or reject a pending ledger entry.
 */
import { getCookiesFromRequest, injectEnv, json, methodNotAllowed, readJsonBody, verifyToken } from "../../_helpers.ts";
import type { CFContext } from "../../env.ts";
import { getLedgerError, reviewLedgerEntry, setKVNamespace } from "../../../private-ledger-store.ts";
import type { ApiErrorResponse } from "../../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    setKVNamespace(context.env.WAELIO_PRIVATE);

    if (context.request.method !== "POST") return methodNotAllowed("POST");

    const session = verifyToken(getCookiesFromRequest(context.request).session);

    try {
        const payload = await reviewLedgerEntry(
            session,
            context.env.ALLOWED_EMAILS,
            await readJsonBody(context.request),
        );
        return json(200, payload);
    } catch (error) {
        const failure = getLedgerError(error);
        return json(failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
    }
};
