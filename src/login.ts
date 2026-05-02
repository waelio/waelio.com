import type {
    ApiErrorResponse,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleConfigResponse,
} from "./shared/auth.ts";

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

const errorEl = requireElement<HTMLDivElement>("login-error");
const googleBtnWrapper = requireElement<HTMLDivElement>("google-btn-wrapper");
const googleBtn = requireElement<HTMLDivElement>("google-btn");

function requireElement<TElement extends HTMLElement>(id: string): TElement {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Missing element: ${id}`);
    }

    return element as TElement;
}

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

function showError(message: string): void {
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function hideError(): void {
    errorEl.hidden = true;
    errorEl.textContent = "";
}

async function loadGoogleConfig(): Promise<GoogleConfigResponse> {
    const response = await fetch("/api/config");
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

async function handleGoogleSignIn(response: GoogleCredentialResponse): Promise<void> {
    hideError();

    try {
        await submitGoogleSignIn({ credential: response.credential });
        window.location.href = "/private.html";
    } catch (error) {
        showError(error instanceof Error ? error.message : String(error));
    }
}

async function initGoogleSignIn(): Promise<void> {
    const config = await loadGoogleConfig();
    if (!config.googleClientId) {
        googleBtnWrapper.style.display = "none";
        showError(
            "Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID in your environment and redeploy or restart the server.",
        );
        return;
    }

    const googleApi = window.google;
    if (!googleApi) {
        googleBtnWrapper.style.display = "none";
        showError("Google sign-in failed to load.");
        return;
    }

    googleApi.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: (credentialResponse) => {
            void handleGoogleSignIn(credentialResponse);
        },
    });

    googleApi.accounts.id.renderButton(googleBtn, {
        theme: "filled_blue",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: GOOGLE_BUTTON_WIDTH,
    });
}

function boot(): void {
    const init = async () => {
        try {
            await initGoogleSignIn();
        } catch (error) {
            googleBtnWrapper.style.display = "none";
            showError(error instanceof Error ? error.message : "Google sign-in is unavailable right now.");
        }
    };

    if (window.google) {
        void init();
        return;
    }

    window.addEventListener("load", () => {
        if (window.google) {
            void init();
            return;
        }

        googleBtnWrapper.style.display = "none";
        showError("Google sign-in failed to load.");
    });
}

boot();
