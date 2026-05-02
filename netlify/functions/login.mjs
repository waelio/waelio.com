import { json, methodNotAllowed } from "./_auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed("POST");

  return json(410, {
    error: "Password sign-in has been removed. Use Google Sign-In.",
  });
}
