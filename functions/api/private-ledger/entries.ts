/**
 * POST /api/private-ledger/entries
 * Creates a new ledger entry.
 */
import { getCookiesFromRequest, injectEnv, json, methodNotAllowed, readJsonBody, verifyToken } from "../../_helpers.ts";
import type { CFContext } from "../../env.ts";
import { getLedgerError, submitLedgerEntry, setKVNamespace } from "../../../private-ledger-store.ts";
import type { ApiErrorResponse } from "../../../src/shared/auth.ts";

export const onRequest: PagesFunction<CFContext["env"]> = async (context) => {
    injectEnv(context.env);
    setKVNamespace(context.env.WAELIO_PRIVATE);

    if (context.request.method !== "POST") return methodNotAllowed("POST");

    const session = verifyToken(getCookiesFromRequest(context.request).session);

    try {
        const payload = await submitLedgerEntry(
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
