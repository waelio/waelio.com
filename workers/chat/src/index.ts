/**
 * waelio-chat-ws — Cloudflare Worker
 *
 * WebSocket chat server using Durable Objects.
 * Implements the same protocol as @waelio/messaging MessagingHub
 * so @waelio/sockets clients connect without any changes.
 *
 * Deploy: wrangler deploy (from workers/chat/)
 * URL: wss://waelio-chat-ws.<account>.workers.dev
 */

export interface Env {
    CHAT_ROOM: DurableObjectNamespace;
}

const MAX_HISTORY = 100;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10_000;
const PING_INTERVAL_MS = 30_000;

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
    ts: number;
}

// ─── Durable Object ───────────────────────────────────────────────────────────

export class ChatRoom {
    private clients = new Map<string, ClientState>();
    private history: StoredMessage[] = [];
    private pingTimer: ReturnType<typeof setInterval> | null = null;

    constructor(_state: DurableObjectState) {}

    async fetch(request: Request): Promise<Response> {
        if (request.headers.get("Upgrade") !== "websocket") {
            return new Response("WebSocket upgrade required", { status: 426 });
        }

        const { 0: client, 1: server } = new WebSocketPair();
        server.accept();

        const id = crypto.randomUUID();
        const state: ClientState = { ws: server, id, msgCount: 0, windowStart: Date.now() };
        this.clients.set(id, state);

        // Start heartbeat
        if (!this.pingTimer) {
            this.pingTimer = setInterval(() => this._ping(), PING_INTERVAL_MS) as any;
        }

        this._send(server, { type: "register-success", id });
        this._broadcastUserList();
        this._toOthers(id, { type: "user-joined", id, ts: Date.now() });

        server.addEventListener("message", (ev) => this._onMessage(state, ev.data as string));
        server.addEventListener("close", () => this._onClose(id));
        server.addEventListener("error", () => this._onClose(id));

        return new Response(null, { status: 101, webSocket: client });
    }

    private _onMessage(c: ClientState, raw: string) {
        const now = Date.now();
        if (now - c.windowStart > RATE_LIMIT_WINDOW_MS) { c.msgCount = 0; c.windowStart = now; }
        if (++c.msgCount > RATE_LIMIT_MAX) {
            this._send(c.ws, { type: "error", message: "Rate limit exceeded." });
            return;
        }

        let msg: any;
        try { msg = JSON.parse(raw); } catch {
            this._send(c.ws, { type: "error", message: "Invalid JSON." });
            return;
        }

        switch (msg.type) {
            case "broadcast": {
                const stored: StoredMessage = { id: crypto.randomUUID(), from: c.id, payload: msg.payload, isBroadcast: true, ts: now };
                this._addHistory(stored);
                this._toOthers(c.id, { type: "message", from: c.id, payload: msg.payload, isBroadcast: true, ts: now });
                break;
            }
            case "route": {
                const dest = this.clients.get(msg.to);
                if (dest) {
                    const stored: StoredMessage = { id: crypto.randomUUID(), from: c.id, payload: msg.payload, isBroadcast: false, ts: now };
                    this._addHistory(stored);
                    this._send(dest.ws, { type: "message", from: c.id, to: msg.to, payload: msg.payload, isBroadcast: false, ts: now });
                } else {
                    this._send(c.ws, { type: "error", message: `User '${msg.to}' not found.` });
                }
                break;
            }
            case "get-history":
                this._send(c.ws, { type: "message-history", history: this.history });
                break;
            case "start-typing":
                this._toOthers(c.id, { type: "user-typing", id: c.id });
                break;
            case "stop-typing":
                this._toOthers(c.id, { type: "user-stopped-typing", id: c.id });
                break;
            case "join-room": {
                const partner = this.clients.get(msg.with);
                if (!partner) { this._send(c.ws, { type: "error", message: "User not online." }); return; }
                const roomId = [c.id, msg.with].sort().join("-");
                this._send(c.ws, { type: "joined-room", roomId, with: msg.with });
                this._send(partner.ws, { type: "joined-room", roomId, with: c.id });
                break;
            }
        }
    }

    private _onClose(id: string) {
        this.clients.delete(id);
        this._broadcastUserList();
        this._toOthers(id, { type: "user-left", id, ts: Date.now() });
        if (this.clients.size === 0 && this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    private _addHistory(msg: StoredMessage) {
        this.history.push(msg);
        if (this.history.length > MAX_HISTORY) this.history.shift();
    }

    private _send(ws: WebSocket, data: unknown) {
        try { ws.send(JSON.stringify(data)); } catch { /* disconnected */ }
    }

    private _broadcastUserList() {
        const users = Array.from(this.clients.keys());
        const msg = JSON.stringify({ type: "user-list", users });
        for (const c of this.clients.values()) {
            try { c.ws.send(msg); } catch { /* ignore */ }
        }
    }

    private _toOthers(senderId: string, data: unknown) {
        const msg = JSON.stringify(data);
        for (const [id, c] of this.clients.entries()) {
            if (id !== senderId) try { c.ws.send(msg); } catch { /* ignore */ }
        }
    }

    private _ping() {
        const msg = JSON.stringify({ type: "ping" });
        for (const c of this.clients.values()) {
            try { c.ws.send(msg); } catch { /* ignore */ }
        }
    }
}

// ─── Worker fetch handler ─────────────────────────────────────────────────────

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Allow CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Upgrade",
                },
            });
        }

        // Only handle WebSocket upgrades at any path
        if (request.headers.get("Upgrade") === "websocket") {
            const roomId = env.CHAT_ROOM.idFromName("global");
            const room = env.CHAT_ROOM.get(roomId);
            return room.fetch(request);
        }

        return new Response("waelio-chat-ws · WebSocket only", { status: 200 });
    },
} satisfies ExportedHandler<Env>;
