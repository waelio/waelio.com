import {
  ALLOWED_EMAILS,
  GOOGLE_CLIENT_ID,
  createSessionCookie,
  json,
  methodNotAllowed,
  readJsonBody,
} from "./_auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed("POST");

  if (!GOOGLE_CLIENT_ID) {
    return json(503, { error: "Google sign-in is not configured" });
  }

  const body = readJsonBody(event);
  if (!body || !body.credential) {
    return json(400, { error: "Missing credential" });
  }

  try {
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
    );

    if (!verifyRes.ok) {
      return json(401, { error: "Invalid Google token" });
    }

    const payload = await verifyRes.json();

    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return json(401, { error: "Token audience mismatch" });
    }

    const email = (payload.email || "").toLowerCase();
    if (!ALLOWED_EMAILS.includes(email)) {
      return json(403, { error: "Email not authorized" });
    }

    const sessionUser = payload.name || email;
    return json(
      200,
      { ok: true, user: sessionUser },
      { "Set-Cookie": createSessionCookie(sessionUser) },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json(500, { error: `Google auth failed: ${message}` });
  }
}
