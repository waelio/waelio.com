const GOOGLE_BUTTON_WIDTH = 340;
const errorEl = requireElement("login-error");
const googleBtnWrapper = requireElement("google-btn-wrapper");
const googleBtn = requireElement("google-btn");
function requireElement(id) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Missing element: ${id}`);
    }
    return element;
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function parseApiError(value) {
    if (isRecord(value) && typeof value.error === "string") {
        return { error: value.error };
    }
    return { error: "Request failed" };
}
function parseConfigResponse(value) {
    if (!isRecord(value) || typeof value.googleClientId !== "string") {
        throw new Error("Invalid Google config response");
    }
    return { googleClientId: value.googleClientId };
}
function parseGoogleAuthResponse(value) {
    if (!isRecord(value)
        || value.ok !== true
        || typeof value.user !== "string"
        || typeof value.email !== "string") {
        throw new Error("Invalid Google auth response");
    }
    return {
        ok: true,
        user: value.user,
        email: value.email,
    };
}
async function readJson(response) {
    return await response.json().catch(() => null);
}
function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
}
function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
}
async function loadGoogleConfig() {
    const response = await fetch("/api/config");
    const payload = await readJson(response);
    if (!response.ok) {
        throw new Error("Authentication backend is not deployed yet. Deploy the Netlify functions for /api/config.");
    }
    return parseConfigResponse(payload);
}
async function submitGoogleSignIn(request) {
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
async function handleGoogleSignIn(response) {
    hideError();
    try {
        await submitGoogleSignIn({ credential: response.credential });
        window.location.href = "/private.html";
    }
    catch (error) {
        showError(error instanceof Error ? error.message : String(error));
    }
}
async function initGoogleSignIn() {
    const config = await loadGoogleConfig();
    if (!config.googleClientId) {
        googleBtnWrapper.style.display = "none";
        showError("Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID in your environment and redeploy or restart the server.");
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
function boot() {
    const init = async () => {
        try {
            await initGoogleSignIn();
        }
        catch (error) {
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
export {};
