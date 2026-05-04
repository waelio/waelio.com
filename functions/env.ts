/**
 * Cloudflare Pages environment bindings.
 * All functions receive these via `context.env`.
 */
export interface Env {
    /** KV namespace for encrypted private ledger storage. */
    WAELIO_PRIVATE: KVNamespace;

    // Environment variables (set in CF dashboard → Settings → Environment variables)
    AUTH_SECRET: string;
    LEDGER_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    ALLOWED_EMAILS: string;
}

/**
 * Typed context for Cloudflare Pages Functions.
 */
export type CFContext = EventContext<Env, string, unknown>;
