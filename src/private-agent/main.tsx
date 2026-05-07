import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { FormEvent, ReactNode } from "react";
import type { ApiErrorResponse, MeResponse } from "../shared/auth.ts";
import type { AgentConfigResponse } from "../shared/agent.ts";
import { disableWaelioRuntimeCaching } from "../shared/browser-runtime.ts";
import { useThemeMode } from "../shared/theme.ts";
import "./styles.css";

type StatusTone = "info" | "success" | "warning" | "error";
type ChatRole = "user" | "agent" | "system";

interface StatusMessage {
    tone: StatusTone;
    text: string;
}

interface ChatMessage {
    id: string;
    role: ChatRole;
    text: string;
    pending?: boolean;
}

interface SessionResponse {
    id?: string;
}

const LOGIN_PAGE = "/login.html";
const PRIVATE_HOME = "/private";
const API_BASE_URL_STORAGE_KEY = "waelio-agent-api-base-url";
const APP_NAME_STORAGE_KEY = "waelio-agent-app-name";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseApiError(value: unknown): ApiErrorResponse {
    if (isRecord(value) && typeof value.error === "string") {
        return { error: value.error };
    }

    return { error: "Request failed" };
}

function parseMeResponse(value: unknown): MeResponse {
    if (!isRecord(value)) {
        throw new Error("Invalid user response");
    }

    return {
        user: typeof value.user === "string" ? value.user : "",
        name: typeof value.name === "string" ? value.name : "",
        email: typeof value.email === "string" ? value.email : "",
        picture: typeof value.picture === "string" || value.picture === null ? value.picture : null,
    };
}

function parseAgentConfigResponse(value: unknown): AgentConfigResponse {
    if (!isRecord(value)) {
        throw new Error("Invalid agent config response");
    }

    return {
        apiBaseUrl: typeof value.apiBaseUrl === "string" ? value.apiBaseUrl : "",
        appName: typeof value.appName === "string" && value.appName.trim() ? value.appName.trim() : "Agent",
    };
}

function createMessageId(): string {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeApiUrl(url: string): string {
    return url.trim().replace(/\/+$/, "");
}

function normalizeAppName(appName: string): string {
    return appName.trim() || "Agent";
}

function isLocalhost(): boolean {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function readStoredValue(key: string): string {
    try {
        return window.localStorage.getItem(key)?.trim() ?? "";
    } catch {
        return "";
    }
}

function persistValue(key: string, value: string): void {
    try {
        if (!value) {
            window.localStorage.removeItem(key);
            return;
        }

        window.localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures.
    }
}

async function readResponseText(response: Response): Promise<string> {
    try {
        return await response.text();
    } catch {
        return "";
    }
}

async function requestJson<TResponse>(
    url: string,
    parser: (value: unknown) => TResponse,
): Promise<TResponse> {
    const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    const rawText = await readResponseText(response);
    let payload: unknown = null;

    if (rawText) {
        try {
            payload = JSON.parse(rawText) as unknown;
        } catch {
            payload = null;
        }
    }

    if (!response.ok) {
        throw Object.assign(new Error(parseApiError(payload).error || rawText || "Request failed"), {
            statusCode: response.status,
        });
    }

    return parser(payload);
}

function buildConnectHelp(apiBaseUrl: string): string {
    if (!apiBaseUrl) {
        return "Set your private ADK backend URL to start chatting.";
    }

    return `Using ${apiBaseUrl}. If connection fails, check that the backend is running and its CORS allowlist includes this site.`;
}

async function createSession(apiBaseUrl: string, appName: string, userId: string): Promise<string> {
    const response = await fetch(
        `${apiBaseUrl}/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        },
    );

    const rawText = await readResponseText(response);
    if (!response.ok) {
        throw new Error(rawText || `Agent backend responded with ${response.status}.`);
    }

    let payload: SessionResponse | null = null;
    try {
        payload = JSON.parse(rawText) as SessionResponse;
    } catch {
        payload = null;
    }

    if (!payload?.id || typeof payload.id !== "string") {
        throw new Error("Agent backend did not return a session ID.");
    }

    return payload.id;
}

async function runAgent(
    apiBaseUrl: string,
    appName: string,
    userId: string,
    sessionId: string,
    text: string,
): Promise<string> {
    const response = await fetch(`${apiBaseUrl}/run_sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            app_name: appName,
            user_id: userId,
            session_id: sessionId,
            new_message: { role: "user", parts: [{ text }] },
            streaming: false,
        }),
    });

    if (!response.ok) {
        const rawText = await readResponseText(response);
        throw new Error(rawText || `Agent request failed with ${response.status}.`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Agent backend did not return a readable response body.");
    }

    const decoder = new TextDecoder();
    let reply = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
            if (!line.startsWith("data:")) {
                continue;
            }

            try {
                const event = JSON.parse(line.slice(5).trim()) as {
                    content?: {
                        parts?: Array<{ text?: string }>;
                    };
                };
                const part = event.content?.parts?.[0]?.text;
                if (part) {
                    reply += part;
                }
            } catch {
                // Ignore partial SSE frames until more bytes arrive.
            }
        }
    }

    return reply.trim() || "The agent responded without any text.";
}

function StatusBanner(props: { status: StatusMessage | null }): ReactNode {
    if (!props.status) return null;

    return (
        <div className={`agent-status agent-status-${props.status.tone}`}>
            {props.status.text}
        </div>
    );
}

function App(): ReactNode {
    const [me, setMe] = useState<MeResponse | null>(null);
    const [config, setConfig] = useState<AgentConfigResponse>({ apiBaseUrl: "", appName: "Agent" });
    const [apiBaseUrl, setApiBaseUrl] = useState("");
    const [apiBaseUrlInput, setApiBaseUrlInput] = useState("");
    const [appName, setAppName] = useState("Agent");
    const [appNameInput, setAppNameInput] = useState("Agent");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draftMessage, setDraftMessage] = useState("");
    const [pageStatus, setPageStatus] = useState<StatusMessage | null>(null);
    const [settingsStatus, setSettingsStatus] = useState<StatusMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [sending, setSending] = useState(false);
    const { theme, setTheme, themeOptions } = useThemeMode();
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const canSend = Boolean(sessionId && draftMessage.trim() && !sending && !connecting);
    const userId = useMemo(() => me?.email.trim().toLowerCase() ?? "", [me?.email]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    useEffect(() => {
        let cancelled = false;

        const loadPage = async () => {
            setLoading(true);

            try {
                await disableWaelioRuntimeCaching();

                const [nextMe, nextConfig] = await Promise.all([
                    requestJson("/api/me", parseMeResponse),
                    requestJson("/api/agent/config", parseAgentConfigResponse),
                ]);

                if (cancelled) return;

                const storedApiBaseUrl = normalizeApiUrl(readStoredValue(API_BASE_URL_STORAGE_KEY));
                const storedAppName = normalizeAppName(readStoredValue(APP_NAME_STORAGE_KEY));
                const defaultApiBaseUrl = normalizeApiUrl(
                    storedApiBaseUrl
                    || nextConfig.apiBaseUrl
                    || (isLocalhost() ? "http://localhost:8000" : ""),
                );
                const defaultAppName = normalizeAppName(storedAppName || nextConfig.appName || "Agent");

                setMe(nextMe);
                setConfig(nextConfig);
                setApiBaseUrl(defaultApiBaseUrl);
                setApiBaseUrlInput(defaultApiBaseUrl);
                setAppName(defaultAppName);
                setAppNameInput(defaultAppName);
                setMessages(defaultApiBaseUrl
                    ? [{
                        id: createMessageId(),
                        role: "system",
                        text: `Ready to connect. ${buildConnectHelp(defaultApiBaseUrl)}`,
                    }]
                    : [{
                        id: createMessageId(),
                        role: "system",
                        text: "Add your private backend URL to begin. This page uses only the backend you point it at.",
                    }]);

                if (defaultApiBaseUrl) {
                    await connect(defaultApiBaseUrl, defaultAppName, nextMe.email, false);
                } else {
                    setPageStatus({
                        tone: "warning",
                        text: "No default backend URL is configured yet. Add one below and connect when you are ready.",
                    });
                }
            } catch (error) {
                if (cancelled) return;

                const statusCode = isRecord(error) && typeof error.statusCode === "number" ? error.statusCode : null;
                if (statusCode === 401) {
                    window.location.href = LOGIN_PAGE;
                    return;
                }

                setPageStatus({
                    tone: "error",
                    text: error instanceof Error ? error.message : String(error),
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const connect = async (
            nextApiBaseUrl: string,
            nextAppName: string,
            nextUserId: string,
            persist: boolean,
        ): Promise<void> => {
            const normalizedApiBaseUrl = normalizeApiUrl(nextApiBaseUrl);
            const normalizedAppName = normalizeAppName(nextAppName);

            if (!normalizedApiBaseUrl) {
                setPageStatus({
                    tone: "warning",
                    text: "Add a backend URL first.",
                });
                return;
            }

            setConnecting(true);
            setSettingsStatus({ tone: "info", text: `Connecting to ${normalizedApiBaseUrl}…` });

            try {
                const nextSessionId = await createSession(normalizedApiBaseUrl, normalizedAppName, nextUserId);
                if (cancelled) return;

                setApiBaseUrl(normalizedApiBaseUrl);
                setAppName(normalizedAppName);
                setSessionId(nextSessionId);
                setMessages([{
                    id: createMessageId(),
                    role: "system",
                    text: `Connected to ${normalizedApiBaseUrl} as ${nextUserId}. Ask the agent anything when you are ready.`,
                }]);
                setPageStatus({
                    tone: "success",
                    text: `Connected successfully. ${buildConnectHelp(normalizedApiBaseUrl)}`,
                });
                setSettingsStatus({
                    tone: "success",
                    text: `Saved and connected to ${normalizedApiBaseUrl}.`,
                });

                if (persist) {
                    persistValue(API_BASE_URL_STORAGE_KEY, normalizedApiBaseUrl);
                    persistValue(APP_NAME_STORAGE_KEY, normalizedAppName);
                }
            } catch (error) {
                if (cancelled) return;

                setSessionId(null);
                setPageStatus({
                    tone: "error",
                    text: error instanceof Error
                        ? `${error.message} Check the backend URL and CORS settings.`
                        : String(error),
                });
                setSettingsStatus({
                    tone: "error",
                    text: "Connection failed. Make sure your ADK backend is running and allows this origin.",
                });
            } finally {
                if (!cancelled) {
                    setConnecting(false);
                }
            }
        };

        void loadPage();

        return () => {
            cancelled = true;
        };
    }, []);

    async function connectAndPersist(event?: FormEvent<HTMLFormElement>): Promise<void> {
        event?.preventDefault();

        if (!me) return;

        const nextApiBaseUrl = normalizeApiUrl(apiBaseUrlInput);
        const nextAppName = normalizeAppName(appNameInput);
        if (!nextApiBaseUrl) {
            setSettingsStatus({ tone: "warning", text: "Enter a backend URL first." });
            return;
        }

        setConnecting(true);
        setSettingsStatus({ tone: "info", text: `Connecting to ${nextApiBaseUrl}…` });

        try {
            const nextSessionId = await createSession(nextApiBaseUrl, nextAppName, me.email);
            setApiBaseUrl(nextApiBaseUrl);
            setAppName(nextAppName);
            setSessionId(nextSessionId);
            setMessages([{
                id: createMessageId(),
                role: "system",
                text: `Connected to ${nextApiBaseUrl} as ${me.email}.`,
            }]);
            setPageStatus({ tone: "success", text: `Connected successfully. ${buildConnectHelp(nextApiBaseUrl)}` });
            setSettingsStatus({ tone: "success", text: `Saved and connected to ${nextApiBaseUrl}.` });
            persistValue(API_BASE_URL_STORAGE_KEY, nextApiBaseUrl);
            persistValue(APP_NAME_STORAGE_KEY, nextAppName);
        } catch (error) {
            setSessionId(null);
            setPageStatus({
                tone: "error",
                text: error instanceof Error
                    ? `${error.message} Check the backend URL and CORS settings.`
                    : String(error),
            });
            setSettingsStatus({
                tone: "error",
                text: "Connection failed. Make sure your ADK backend is running and allows this origin.",
            });
        } finally {
            setConnecting(false);
        }
    }

    function resetToDefaults(): void {
        const defaultApiBaseUrl = normalizeApiUrl(config.apiBaseUrl || (isLocalhost() ? "http://localhost:8000" : ""));
        const defaultAppName = normalizeAppName(config.appName || "Agent");

        persistValue(API_BASE_URL_STORAGE_KEY, "");
        persistValue(APP_NAME_STORAGE_KEY, "");
        setApiBaseUrl(defaultApiBaseUrl);
        setApiBaseUrlInput(defaultApiBaseUrl);
        setAppName(defaultAppName);
        setAppNameInput(defaultAppName);
        setSessionId(null);
        setMessages([{
            id: createMessageId(),
            role: "system",
            text: defaultApiBaseUrl
                ? `Defaults restored. Reconnect when you are ready.`
                : "Defaults restored. Add a backend URL and connect when ready.",
        }]);
        setSettingsStatus({ tone: "info", text: "Saved browser overrides cleared." });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canSend || !userId || !sessionId) {
            return;
        }

        const text = draftMessage.trim();
        const thinkingId = createMessageId();

        setDraftMessage("");
        setSending(true);
        setPageStatus(null);
        setMessages((current) => ([
            ...current,
            { id: createMessageId(), role: "user", text },
            { id: thinkingId, role: "agent", text: "Thinking…", pending: true },
        ]));

        try {
            const reply = await runAgent(apiBaseUrl, appName, userId, sessionId, text);
            setMessages((current) => current.map((message) => message.id === thinkingId
                ? { ...message, text: reply, pending: false }
                : message));
        } catch (error) {
            const errorText = error instanceof Error
                ? `${error.message} Check the backend URL and CORS settings.`
                : String(error);
            setMessages((current) => current.map((message) => message.id === thinkingId
                ? { ...message, text: errorText, pending: false }
                : message));
            setPageStatus({ tone: "error", text: errorText });
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return <div className="loading-state">Loading your private agent workspace…</div>;
    }

    return (
        <div className="agent-page-shell">
            <header className="agent-page-header">
                <div>
                    <div className="agent-eyebrow">Private agent</div>
                    <h1>waelio private agent</h1>
                    <p className="agent-subtitle">
                        Personal agent access for {me?.name ?? "you"}. Your frontend is private here; your billing depends only on the backend URL you choose.
                    </p>
                </div>
                <div className="agent-toolbar">
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
                    <a href={PRIVATE_HOME} className="btn-outline">Back to private</a>
                </div>
            </header>

            <StatusBanner status={pageStatus} />

            <div className="agent-grid">
                <section className="agent-card">
                    <div className="agent-card-header">
                        <div>
                            <h2>Connection settings</h2>
                            <p>Point this page at your own ADK backend. Nothing here forces you to pay for anyone else.</p>
                        </div>
                        <span className={sessionId ? "agent-pill agent-pill-connected" : "agent-pill"}>
                            {sessionId ? "Connected" : "Not connected"}
                        </span>
                    </div>

                    <form className="agent-settings-form" onSubmit={(event) => { void connectAndPersist(event); }}>
                        <label className="agent-field">
                            <span>Backend URL</span>
                            <input
                                type="url"
                                inputMode="url"
                                placeholder="https://your-adk-backend.example.com"
                                value={apiBaseUrlInput}
                                onChange={(event) => {
                                    setApiBaseUrlInput(event.target.value);
                                }}
                            />
                            <small>{buildConnectHelp(apiBaseUrlInput || apiBaseUrl)}</small>
                        </label>

                        <label className="agent-field">
                            <span>App name</span>
                            <input
                                type="text"
                                value={appNameInput}
                                onChange={(event) => {
                                    setAppNameInput(event.target.value);
                                }}
                                placeholder="Agent"
                            />
                            <small>Defaults to the configured agent app name. Change it only if your backend uses a different ADK app name.</small>
                        </label>

                        <div className="agent-actions">
                            <button type="submit" className="btn-primary agent-connect-btn" disabled={connecting || !me}>
                                {connecting ? "Connecting…" : "Save and connect"}
                            </button>
                            <button type="button" className="btn-outline" onClick={resetToDefaults} disabled={connecting}>
                                Clear browser override
                            </button>
                        </div>
                    </form>

                    <StatusBanner status={settingsStatus} />

                    <dl className="agent-meta-list">
                        <div>
                            <dt>Signed in as</dt>
                            <dd>{me?.email ?? "—"}</dd>
                        </div>
                        <div>
                            <dt>Active backend</dt>
                            <dd>{apiBaseUrl || "Not set"}</dd>
                        </div>
                        <div>
                            <dt>Configured default</dt>
                            <dd>{config.apiBaseUrl || (isLocalhost() ? "http://localhost:8000" : "Not set")}</dd>
                        </div>
                        <div>
                            <dt>Agent app name</dt>
                            <dd>{appName}</dd>
                        </div>
                    </dl>

                    <div className="agent-note-box">
                        <strong>Backend reminder</strong>
                        <p>
                            Cloudflare Pages hosts this UI only. Your ADK backend must run somewhere else and allow this site origin in CORS.
                        </p>
                    </div>
                </section>

                <section className="agent-card agent-chat-card">
                    <div className="agent-card-header">
                        <div>
                            <h2>Chat</h2>
                            <p>Once connected, messages go only to the backend URL shown in your settings.</p>
                        </div>
                        <span className="agent-pill">{appName}</span>
                    </div>

                    <div className="agent-chat-log" aria-live="polite">
                        {messages.map((message) => (
                            <article
                                key={message.id}
                                className={`agent-message agent-message-${message.role}${message.pending ? " agent-message-pending" : ""}`}
                            >
                                <div className="agent-message-label">
                                    {message.role === "user" ? "You" : message.role === "agent" ? "Agent" : "Status"}
                                </div>
                                <div className="agent-message-text">{message.text}</div>
                            </article>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form className="agent-chat-form" onSubmit={(event) => { void handleSubmit(event); }}>
                        <textarea
                            rows={4}
                            placeholder={sessionId
                                ? "Ask your private agent anything…"
                                : "Connect to your backend before sending a message…"}
                            value={draftMessage}
                            onChange={(event) => {
                                setDraftMessage(event.target.value);
                            }}
                            disabled={!sessionId || sending || connecting}
                        />
                        <div className="agent-actions">
                            <button type="submit" className="btn-primary agent-send-btn" disabled={!canSend}>
                                {sending ? "Sending…" : "Send"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

const container = document.getElementById("app");
if (!container) {
    throw new Error("Missing app root");
}

createRoot(container).render(<App />);