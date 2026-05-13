// siteforgee/store.ts
// Simple file-based store for webhook blueprints
import { blueprints, WebhookBlueprint } from "./blueprints.ts";

export async function saveBlueprint(event: string, payload: any) {
    const entry: WebhookBlueprint = {
        timestamp: new Date().toISOString(),
        event,
        payload,
    };
    blueprints.push(entry);
    // In a real app, persist to durable storage (KV, DB, or file)
    // For now, just log
    console.log("Blueprint saved:", entry);
}
