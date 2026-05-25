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
    AGENT_API_BASE_URL?: string;
    AGENT_APP_NAME?: string;

    // Optional R2/S3 credentials for Cloudflare R2 usage.
    R2_ACCOUNT_ID?: string;
    R2_BUCKET_NAME?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_ENDPOINT?: string;
}

/**
 * Typed context for Cloudflare Pages Functions.
 */
export type CFContext = EventContext<Env, string, unknown>;
