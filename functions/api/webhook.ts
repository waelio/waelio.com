// functions/api/webhook.ts
// Webhook endpoint to receive npm publish events
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// Helper to get env secret (works for Deno Deploy/Cloudflare/Node)
function getWebhookSecret(): string | undefined {
    return Deno.env.get("WEBHOOK_SECRET") || (typeof process !== "undefined" ? process.env.WEBHOOK_SECRET : undefined);
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    // Secret verification: look for 'x-webhook-secret' header or 'secret' in body
    const expectedSecret = getWebhookSecret();
    const headerSecret = req.headers.get("x-webhook-secret");

    let bodySecret: string | undefined;
    let payload: any = undefined;
    try {
        payload = await req.json();
        bodySecret = payload?.secret;
    } catch (err) {
        return new Response("Invalid payload", { status: 400 });
    }

    if (!expectedSecret || (headerSecret !== expectedSecret && bodySecret !== expectedSecret)) {
        return new Response("Forbidden: invalid secret", { status: 403 });
    }

    // Example: Extract package name and version
    const pkgName = payload?.name || payload?.package?.name;
    const version = payload?.version || payload?.package?.version;

    // TODO: Store or process the new package info as needed
    console.log("Received new npm package:", pkgName, version);

    return new Response("Webhook received", { status: 200 });
});
