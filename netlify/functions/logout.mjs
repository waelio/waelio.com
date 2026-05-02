import { clearSessionCookie, methodNotAllowed, redirect } from "./_auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  return redirect("/", { "Set-Cookie": clearSessionCookie() });
}
