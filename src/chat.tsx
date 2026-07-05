import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { FormEvent, ReactNode } from "react";
import { createSocket, type WaelioSocket } from "@waelio/sockets";
import type {
    ApiErrorResponse,
    GoogleAuthRequest,
    GoogleAuthSuccessResponse,
    GoogleConfigResponse,
    MeResponse,
} from "./shared/auth.ts";
import { disableWaelioRuntimeCaching } from "./shared/browser-runtime.ts";
import { useThemeMode } from "./shared/theme.ts";

const MESSAGING_URL = "wss://waelio-messagin-live.onrender.com";
const MAX_MESSAGES = 200;
const GOOGLE_BUTTON_WIDTH = 340;

type ChatMessage = {
    id: string;
    from: string;
    text: string;
    ts: number;
    type: string;
};

type MessagingEnvelope = {
    id?: string;
    type?: string;
    from?: string;
    user?: string;
    sender?: string;
    senderId?: string;
    payload?: unknown;
    text?: string;
    message?: string;
    ts?: number | string;
    timestamp?: number | string;
    isBroadcast?: boolean;
    to?: string;
    recipientId?: string;
    meta?: unknown;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function makeId(prefix = "msg"): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeTimestamp(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
        }
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return Date.now();
}

function readPayload(value: unknown): { text: string; fromName?: string } {
    if (typeof value === "string") {
        return { text: value };
    }
    if (isRecord(value)) {
        const text =
            (typeof value.text === "string" && value.text) ||
            (typeof value.message === "string" && value.message) ||
            "";
        const fromName = typeof value.fromName === "string" ? value.fromName : undefined;
        if (text) {
            return { text, fromName };
        }
    }
    return { text: typeof value === "object" && value ? JSON.stringify(value) : "" };
}

function normalizeMessage(msg: MessagingEnvelope): ChatMessage {
    const payload = readPayload(msg.payload);
    const metaName = isRecord(msg.meta) && typeof msg.meta.fromName === "string" ? msg.meta.fromName : undefined;
    const text =
        payload.text ||
        (typeof msg.text === "string" && msg.text) ||
        (typeof msg.message === "string" && msg.message) ||
        "";

    const type =
        msg.type ||
        (msg.isBroadcast ? "broadcast" : (msg.recipientId || msg.to) ? "direct" : "message");

    const fromName = payload.fromName || metaName;

    return {
        id: msg.id || makeId("msg"),
        type,
        from: fromName || msg.from || msg.user || msg.sender || msg.senderId || "Guest",
        text,
        ts: normalizeTimestamp(msg.ts ?? msg.timestamp),
    };
}

function formatTime(ts: number): string {
    try {
        return new Date(ts).toLocaleTimeString();
    } catch {
        return "";
    }
}

async function readJson(response: Response): Promise<unknown> {
    return await response.json().catch(() => null);
}

async function loadChatUser(): Promise<MeResponse | null> {
    const response = await fetch("/api/chat/me", {
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
    });
    if (response.status === 401) {
        return null;
    }
    const payload = await readJson(response);
    if (!response.ok || !isRecord(payload) || typeof payload.name !== "string" || typeof payload.email !== "string") {
        return null;
    }
    return {
        user: typeof payload.user === "string" ? payload.user : payload.name,
        name: payload.name,
        email: payload.email,
        picture: typeof payload.picture === "string" ? payload.picture : null,
    };
}

function ChatApp(): ReactNode {
    const { theme, setTheme, themeOptions } = useThemeMode();
    const [user, setUser] = useState<MeResponse | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const socketRef = useRef<WaelioSocket | null>(null);
    const logEndRef = useRef<HTMLDivElement | null>(null);
    const googleButtonRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        void disableWaelioRuntimeCaching();
        document.title = "Secure chat – waelio.com";

        void loadChatUser()
            .then((session) => {
                setUser(session);
            })
            .finally(() => {
                setAuthLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!user || authLoading) {
            return;
        }

        setConnecting(true);
        const client = createSocket(MESSAGING_URL, {
            reconnect: true,
            maxRetries: 5,
            retryDelay: 2000,
        });
        socketRef.current = client;

        const pushMessage = (message: ChatMessage) => {
            setMessages((current) => {
                const exists = current.some((entry) =>
                    entry.id === message.id ||
                    (entry.ts === message.ts && entry.from === message.from && entry.text === message.text)
                );
                if (exists) {
                    return current;
                }
                const next = [...current, message];
                return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
            });
        };

        client.onOpen(() => {
            setConnected(true);
            setConnecting(false);
            setError(null);
            client.send({ type: "get-history" });
        });

        client.onClose(() => {
            setConnected(false);
            setConnecting(false);
            setError("Disconnected from chat server");
        });

        client.onError(() => {
            setConnected(false);
            setConnecting(false);
            setError("Connection error: websocket error");
        });

        // MessagingHub sends { type: 'message', from, payload, isBroadcast }
        client.on("message", (msg: MessagingEnvelope) => {
            pushMessage(normalizeMessage(msg));
        });

        // MessagingHub sends { type: 'message-history', history: [...] }
        client.on("message-history", (data: { history?: MessagingEnvelope[] }) => {
            const history = Array.isArray(data?.history) ? data.history : [];
            setMessages(history.map((entry) => normalizeMessage(entry)).slice(-MAX_MESSAGES));
        });

        client.connect();

        return () => {
            client.disconnect();
            socketRef.current = null;
            setConnected(false);
            setConnecting(false);
        };
    }, [user, authLoading]);

    useEffect(() => {
        if (authLoading || user || !googleButtonRef.current) {
            return;
        }

        let cancelled = false;

        const initGoogleSignIn = async () => {
            try {
                const configResponse = await fetch("/api/config", {
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });
                const configPayload = await readJson(configResponse);
                if (!configResponse.ok || !isRecord(configPayload) || typeof configPayload.googleClientId !== "string") {
                    throw new Error("Google sign-in is not ready yet.");
                }
                const config = configPayload as GoogleConfigResponse;

                await new Promise<void>((resolve) => {
                    if (window.google?.accounts?.id) {
                        resolve();
                        return;
                    }
                    const started = Date.now();
                    const timer = window.setInterval(() => {
                        if (window.google?.accounts?.id || Date.now() - started > 10000) {
                            window.clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });

                if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
                    throw new Error("Google sign-in failed to load.");
                }

                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,
                    callback: (credentialResponse) => {
                        void handleGoogleSignIn(credentialResponse);
                    },
                });
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: "filled_blue",
                    size: "large",
                    shape: "pill",
                    text: "continue_with",
                    width: GOOGLE_BUTTON_WIDTH,
                });
                setAuthError(null);
            } catch (initError) {
                if (!cancelled) {
                    setAuthError(initError instanceof Error ? initError.message : "Google sign-in is unavailable.");
                }
            }
        };

        async function handleGoogleSignIn(credentialResponse: GoogleCredentialResponse) {
            setIsSubmitting(true);
            setAuthError(null);
            try {
                const body: GoogleAuthRequest = { credential: credentialResponse.credential };
                const response = await fetch("/api/auth/google-chat", {
                    method: "POST",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
                const payload = await readJson(response);
                if (!response.ok) {
                    const apiError = isRecord(payload) && typeof payload.error === "string"
                        ? payload.error
                        : "Sign-in failed";
                    throw new Error(apiError);
                }
                if (
                    !isRecord(payload)
                    || payload.ok !== true
                    || typeof payload.user !== "string"
                    || typeof payload.email !== "string"
                ) {
                    throw new Error("Invalid sign-in response");
                }
                const auth = payload as GoogleAuthSuccessResponse;
                setUser({
                    user: auth.user,
                    name: auth.user,
                    email: auth.email,
                    picture: null,
                });
            } catch (signInError) {
                setAuthError(signInError instanceof Error ? signInError.message : "Sign-in failed");
            } finally {
                setIsSubmitting(false);
            }
        }

        void initGoogleSignIn();

        return () => {
            cancelled = true;
        };
    }, [authLoading, user]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    function send(event?: FormEvent) {
        event?.preventDefault();
        const text = draft.trim();
        const client = socketRef.current;
        if (!text || !client || !connected || !user) {
            return;
        }

        setError(null);
        client.send({
            type: "broadcast",
            payload: {
                text,
                fromName: user.name,
            },
        });
        setDraft("");
    }

    const statusLabel = !user
        ? "Sign in required"
        : connected
            ? "Connected"
            : connecting
                ? "Connecting…"
                : "Offline";
    const statusClass = connected
        ? "chat-status chat-status-live"
        : connecting
            ? "chat-status chat-status-pending"
            : "chat-status chat-status-offline";

    return (
        <>
            <header>
                <div className="site-branding">
                    <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                        <img src="/logo.png?v=20260502" alt="waelio logo" className="brand-lockup brand-lockup-header" />
                        <h1 className="site-title">Secure chat</h1>
                    </a>
                </div>
                <div className="header-nav">
                    <span className={statusClass}>{statusLabel}</span>
                    <a href="/" className="nav-link">← Packages</a>
                    <div className="theme-switcher" role="group" aria-label="Choose theme">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={theme === option.value ? "theme-option theme-option-active" : "theme-option"}
                                aria-pressed={theme === option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                }}
                            >
                                <span className="theme-option-icon" aria-hidden="true">{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="chat-page-shell">
                <section className="chat-hero-card" aria-label="Chat introduction">
                    <div className="hero-eyebrow">Direct channel · no social apps</div>
                    <h2 className="hero-title">Talk to Wael here — not on WhatsApp or Facebook</h2>
                    <p className="hero-description">
                        Sign in with Google and send a message. Open to anyone. No WhatsApp. No social networks.
                    </p>
                    {user ? (
                        <p className="chat-meta-line">Signed in as <strong>{user.name}</strong></p>
                    ) : (
                        <p className="chat-meta-line">Sign in with Google to read and send messages.</p>
                    )}
                </section>

                {!user && !authLoading ? (
                    <section className="chat-auth-card" aria-label="Sign in to chat">
                        <h3 className="chat-auth-title">Sign in to continue</h3>
                        <p className="chat-auth-copy">Your Google name is shown in chat. Messages stay on waelio.com.</p>
                        <div ref={googleButtonRef} />
                        {isSubmitting ? <p className="chat-meta-line">Signing you in…</p> : null}
                        {authError ? <div className="chat-error-banner" role="alert">{authError}</div> : null}
                    </section>
                ) : null}

                {error && user ? (
                    <div className="chat-error-banner" role="alert">{error}</div>
                ) : null}

                {user ? (
                    <section className="chat-panel" aria-label="Chat messages">
                        <div className="chat-log" aria-live="polite">
                            {messages.length === 0 ? (
                                <p className="chat-empty">No messages yet. Say hello to Wael.</p>
                            ) : (
                                messages.map((message) => (
                                    <article key={message.id} className="chat-message">
                                        <div className="chat-message-meta">
                                            <span className="chat-message-author">
                                                {message.from === user.name ? "You" : message.from}
                                            </span>
                                            <span className="chat-message-time">{formatTime(message.ts)}</span>
                                        </div>
                                        <p className="chat-message-text">{message.text}</p>
                                    </article>
                                ))
                            )}
                            <div ref={logEndRef} />
                        </div>

                        <form className="chat-compose" onSubmit={send}>
                            <label className="sr-only" htmlFor="chat-input">Message</label>
                            <input
                                id="chat-input"
                                className="chat-input"
                                value={draft}
                                onChange={(event) => {
                                    setDraft(event.target.value);
                                }}
                                placeholder={connected ? "Write your message to Wael" : "Connecting…"}
                                disabled={!connected}
                                autoComplete="off"
                            />
                            <button type="submit" className="chat-send" disabled={!connected || !draft.trim()}>
                                Send
                            </button>
                        </form>
                    </section>
                ) : null}
            </main>

            <footer className="site-footer">
                <span className="muted">© 2026 waelio.com · secure direct chat</span>
                <div className="footer-links">
                    <a href="/privacy.html">Privacy</a>
                </div>
            </footer>
        </>
    );
}

const container = document.getElementById("app");
if (!container) {
    throw new Error("Missing app root");
}

createRoot(container).render(<ChatApp />);
