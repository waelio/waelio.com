import { json, methodNotAllowed, parseCookies, verifyToken } from "./_auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  const user = verifyToken(parseCookies(event.headers).session);
  if (!user) {
    return json(401, { error: "Not authenticated" });
  }

  return json(200, { user });
}
