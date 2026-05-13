// This file stores webhook blueprints for siteforgee/steForge to build the site.
// Each entry is a JSON object representing a webhook event.

export type WebhookBlueprint = {
    timestamp: string;
    event: string;
    payload: any;
};

export const blueprints: WebhookBlueprint[] = [];
