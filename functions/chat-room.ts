/**
 * ChatRoom Durable Object
 *
 * Runs on Cloudflare Workers with Durable Objects.
 * Handles all WebSocket connections for waelio.com/chat/
 * using the same protocol as @waelio/messaging MessagingHub.
 */

export interface Env {
    CHAT_ROOM: DurableObjectNamespace;
}

const MAX_HISTORY = 100;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 30_000;

interface ClientState {
    ws: WebSocket;
    id: string;
    msgCount: number;
    windowStart: number;
}

interface StoredMessage {
    id: string;
    from: string;
    payload: unknown;
    isBroadcast: boolean;
    roomId?: string;
    ts: number;
}

export class ChatRoom {
    private clients = new Map<string, ClientState>();
    private history: StoredMessage[] = [];
    private state: DurableObjectState;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const upgradeHeader = request.headers.get("Upgrade");
        if (upgradeHeader !== "websocket") {
            return new Response("Expected WebSocket", { status: 426 });
        }

        const { 0: clientWs, 1: serverWs } = new WebSocketPair();
        serverWs.accept();

        const clientId = crypto.randomUUID();
        const client: ClientState = {
            ws: serverWs,
            id: clientId,
            msgCount: 0,
            windowStart: Date.now(),
        };
        this.clients.set(clientId, client);

        // Start heartbeat if first client
        if (this.clients.size === 1 && !this.heartbeatTimer) {
            this.heartbeatTimer = setInterval(() => this._pingAll(), HEARTBEAT_INTERVAL_MS) as any;
        }

        // Send registration
        this._send(serverWs, { type: "register-success", id: clientId });
        this._broadcastUserList();
        this._broadcastToOthers(clientId, { type: "user-joined", id: clientId, ts: Date.now() });

        serverWs.addEventListener("message", (event) => {
            this._handleMessage(client, event.data as string);
        });

        serverWs.addEventListener("close", () => {
            this._handleClose(clientId);
        });

        serverWs.addEventListener("error", () => {
            this._handleClose(clientId);
        });

        return new Response(null, { status: 101, webSocket: clientWs });
    }

    private _handleMessage(client: ClientState, raw: string) {
        const now = Date.now();

        // Rate limiting
        if (now - client.windowStart > RATE_LIMIT_WINDOW_MS) {
            client.msgCount = 0;
            client.windowStart = now;
        }
        if (++client.msgCount > RATE_LIMIT_MAX) {
            this._send(client.ws, { type: "error", message: "Rate limit exceeded." });
            return;
        }

        let msg: any;
        try {
            msg = JSON.parse(raw);
        } catch {
            this._send(client.ws, { type: "error", message: "Invalid JSON." });
            return;
        }

        const { type } = msg;

        switch (type) {
            case "broadcast": {
                const stored: StoredMessage = {
                    id: crypto.randomUUID(),
                    from: client.id,
                    payload: msg.payload,
                    isBroadcast: true,
                    ts: now,
                };
                this._addToHistory(stored);
                this._broadcastToOthers(client.id, {
                    type: "message",
                    from: client.id,
                    payload: msg.payload,
                    isBroadcast: true,
                    ts: now,
                });
                break;
            }

            case "route": {
                const dest = this.clients.get(msg.to);
                if (dest) {
                    const stored: StoredMessage = {
                        id: crypto.randomUUID(),
                        from: client.id,
                        payload: msg.payload,
                        isBroadcast: false,
                        ts: now,
                    };
                    this._addToHistory(stored);
                    this._send(dest.ws, {
                        type: "message",
                        from: client.id,
                        to: msg.to,
                        payload: msg.payload,
                        isBroadcast: false,
                        ts: now,
                    });
                } else {
                    this._send(client.ws, { type: "error", message: `User '${msg.to}' not found.` });
                }
                break;
            }

            case "get-history": {
                this._send(client.ws, { type: "message-history", history: this.history });
                break;
            }

            case "start-typing": {
                this._broadcastToOthers(client.id, { type: "user-typing", id: client.id });
                break;
            }

            case "stop-typing": {
                this._broadcastToOthers(client.id, { type: "user-stopped-typing", id: client.id });
                break;
            }

            case "join-room": {
                const partner = this.clients.get(msg.with);
                if (!partner) {
                    this._send(client.ws, { type: "error", message: `User '${msg.with}' is not online.` });
                    return;
                }
                const roomId = [client.id, msg.with].sort().join("-");
                this._send(client.ws, { type: "joined-room", roomId, with: msg.with });
                this._send(partner.ws, { type: "joined-room", roomId, with: client.id });
                break;
            }

            default:
                this._send(client.ws, { type: "error", message: "Unknown message type." });
        }
    }

    private _handleClose(clientId: string) {
        this.clients.delete(clientId);
        this._broadcastUserList();
        this._broadcastToOthers(clientId, { type: "user-left", id: clientId, ts: Date.now() });

        if (this.clients.size === 0 && this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private _addToHistory(msg: StoredMessage) {
        this.history.push(msg);
        if (this.history.length > MAX_HISTORY) {
            this.history.shift();
        }
    }

    private _send(ws: WebSocket, data: unknown) {
        try {
            ws.send(JSON.stringify(data));
        } catch {
            // client disconnected
        }
    }

    private _broadcastUserList() {
        const users = Array.from(this.clients.keys());
        const msg = JSON.stringify({ type: "user-list", users });
        for (const c of this.clients.values()) {
            try { c.ws.send(msg); } catch { /* ignore */ }
        }
    }

    private _broadcastToOthers(senderId: string, data: unknown) {
        const msg = JSON.stringify(data);
        for (const [id, c] of this.clients.entries()) {
            if (id !== senderId) {
                try { c.ws.send(msg); } catch { /* ignore */ }
            }
        }
    }

    private _pingAll() {
        for (const c of this.clients.values()) {
            try { c.ws.send(JSON.stringify({ type: "ping" })); } catch { /* ignore */ }
        }
    }
}
