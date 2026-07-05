import type { ChatRoom } from "../chat-room";

export interface Env {
    CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
}

/**
 * GET /api/ws — WebSocket upgrade endpoint for waelio.com/chat/
 * Routes all connections to a single shared ChatRoom Durable Object.
 */
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const upgradeHeader = ctx.request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
        return new Response("WebSocket upgrade required", { status: 426 });
    }

    // Use a single shared room for the global chat
    const roomId = ctx.env.CHAT_ROOM.idFromName("global");
    const room = ctx.env.CHAT_ROOM.get(roomId);

    return room.fetch(ctx.request);
};
