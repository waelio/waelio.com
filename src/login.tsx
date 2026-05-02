import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import type {
    ApiErrorResponse,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleConfigResponse,
} from "./shared/auth.ts";
import { disableWaelioRuntimeCaching } from "./shared/browser-runtime.ts";

interface GoogleCredentialResponse {
    credential: string;
}

interface GoogleButtonOptions {
    theme: "filled_blue";
    size: "large";
    shape: "pill";
    text: "continue_with";
    width: number;
}

interface GoogleAccountsIdApi {
    initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
    renderButton(target: HTMLElement, options: GoogleButtonOptions): void;
}

interface GoogleGlobal {
    accounts: {
        id: GoogleAccountsIdApi;
    };
}

declare global {
    interface Window {
        google?: GoogleGlobal;
    }
}

const GOOGLE_BUTTON_WIDTH = 340;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseApiError(value: unknown): ApiErrorResponse {
    if (isRecord(value) && typeof value.error === "string") {
        return { error: value.error };
    }

    return { error: "Request failed" };
}

function parseConfigResponse(value: unknown): GoogleConfigResponse {
    if (!isRecord(value) || typeof value.googleClientId !== "string") {
        throw new Error("Invalid Google config response");
    }

    return { googleClientId: value.googleClientId };
}

function parseGoogleAuthResponse(value: unknown): GoogleAuthSuccessResponse {
    if (
        !isRecord(value)
        || value.ok !== true
        || typeof value.user !== "string"
        || typeof value.email !== "string"
    ) {
        throw new Error("Invalid Google auth response");
    }

    return {
        ok: true,
        user: value.user,
        email: value.email,
    };
}

async function readJson(response: Response): Promise<unknown> {
    return await response.json().catch(() => null);
}

async function loadGoogleConfig(): Promise<GoogleConfigResponse> {
    const response = await fetch("/api/config", {
        credentials: "same-origin",
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });
    const payload = await readJson(response);

    if (!response.ok) {
        throw new Error(
            "Authentication backend is not deployed yet. Deploy the Netlify functions for /api/config.",
        );
    }

    return parseConfigResponse(payload);
}

async function submitGoogleSignIn(request: GoogleAuthRequest): Promise<GoogleAuthSuccessResponse> {
    const response = await fetch("/api/auth/google", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    const payload = await readJson(response);
    if (!response.ok) {
        const error = parseApiError(payload);
        throw new Error(error.error);
    }

    return parseGoogleAuthResponse(payload);
}

async function waitForGoogleApi(timeoutMs = 10000): Promise<GoogleGlobal> {
    if (window.google) {
        return window.google;
    }

    return await new Promise<GoogleGlobal>((resolve, reject) => {
        let elapsed = 0;
        const intervalMs = 250;
        const intervalId = window.setInterval(() => {
            if (window.google) {
                window.clearInterval(intervalId);
                resolve(window.google);
                return;
            }

            elapsed += intervalMs;
            if (elapsed >= timeoutMs) {
                window.clearInterval(intervalId);
                reject(new Error("Google sign-in failed to load."));
            }
        }, intervalMs);
    });
}

function LoginApp(): ReactNode {
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPreparing, setIsPreparing] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const handleGoogleSignIn = async (response: GoogleCredentialResponse): Promise<void> => {
            if (cancelled) {
                return;
            }

            setErrorMessage(null);
            setIsSubmitting(true);

            try {
                await submitGoogleSignIn({ credential: response.credential });
                await disableWaelioRuntimeCaching();
                window.location.href = "/private";
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                    setIsSubmitting(false);
                }
            }
        };

        const initGoogleSignIn = async () => {
            try {
                await disableWaelioRuntimeCaching();
                const config = await loadGoogleConfig();
                if (!config.googleClientId) {
                    throw new Error(
                        "Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID in your environment and redeploy or restart the server.",
                    );
                }

                const googleApi = await waitForGoogleApi();
                if (cancelled) {
                    return;
                }

                const buttonHost = googleButtonRef.current;
                if (!buttonHost) {
                    throw new Error("Missing Google sign-in button host");
                }

                buttonHost.innerHTML = "";
                googleApi.accounts.id.initialize({
                    client_id: config.googleClientId,
                    callback: (credentialResponse) => {
                        void handleGoogleSignIn(credentialResponse);
                    },
                });
                googleApi.accounts.id.renderButton(buttonHost, {
                    theme: "filled_blue",
                    size: "large",
                    shape: "pill",
                    text: "continue_with",
                    width: GOOGLE_BUTTON_WIDTH,
                });

                setErrorMessage(null);
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(error instanceof Error ? error.message : "Google sign-in is unavailable right now.");
                }
            } finally {
                if (!cancelled) {
                    setIsPreparing(false);
                }
            }
        };

        void initGoogleSignIn();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">
                    <img
                        src="/logo.png?v=20260502"
                        alt="waelio logo"
                        className="brand-lockup brand-lockup-auth"
                    />
                </div>
                <h1 className="auth-title">Sign in</h1>
                <p className="auth-subtitle">
                    Use your approved Google account to open your private workspace.
                </p>

                <div className="google-signin-wrapper">
                    <div ref={googleButtonRef} />
                </div>

                {isPreparing ? <div className="muted">Preparing Google sign-in…</div> : null}
                {isSubmitting ? <div className="muted">Signing you in…</div> : null}
                {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

                <a href="/" className="auth-back">← Back to waelio.com</a>
                <div className="legal-links">
                    <a href="/privacy.html">Privacy Policy</a>
                    <a href="/terms.html">Terms of Service</a>
                </div>
            </div>
        </div>
    );
}

const container = document.getElementById("app");
if (!container) {
    throw new Error("Missing app root");
}

createRoot(container).render(<LoginApp />);
