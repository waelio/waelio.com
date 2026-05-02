import {
    connectNetlifyBlobs,
    json,
    methodNotAllowed,
    parseCookies,
    readJsonBody,
    verifyToken,
    type NetlifyFunctionEvent,
    type NetlifyFunctionResponse,
} from "./_auth.ts";
import { getLedgerError, submitLedgerEntry } from "../../private-ledger-store.ts";
import type { ApiErrorResponse } from "../../src/shared/auth.ts";

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
    if (event.httpMethod !== "POST") return methodNotAllowed("POST");

    connectNetlifyBlobs(event);
    const session = verifyToken(parseCookies(event.headers).session);

    try {
        const payload = await submitLedgerEntry(session, process.env.ALLOWED_EMAILS, readJsonBody(event));
        return json(200, payload);
    } catch (error) {
        const failure = getLedgerError(error);
        return json(failure.statusCode, { error: failure.message } satisfies ApiErrorResponse);
    }
}
