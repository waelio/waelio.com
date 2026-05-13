// functions/api/webhook/push.ts
// Webhook endpoint for push events with its own secret

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { saveBlueprint } from "../../../siteforgee/store.ts";

function getPushSecret(): string | undefined {
    return Deno.env.get("WEBHOOK_PUSH_SECRET") || (typeof process !== "undefined" ? process.env.WEBHOOK_PUSH_SECRET : undefined);
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const expectedSecret = getPushSecret();
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

    // Save the webhook as a blueprint for siteforgee
    await saveBlueprint("push", payload);
    return new Response("Push webhook received and saved", { status: 200 });
});
