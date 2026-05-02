import { GOOGLE_CLIENT_ID, json, methodNotAllowed } from "./_auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  return json(200, { googleClientId: GOOGLE_CLIENT_ID });
}
