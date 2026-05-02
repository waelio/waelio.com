export const DEFAULT_GOOGLE_CLIENT_ID =
  "31789329675-rsj8d75u2o3te84vccgj7ptdhs83nhqr.apps.googleusercontent.com";

const PLACEHOLDER_PATTERNS = [
  /^your-google-oauth-web-client-id\.apps\.googleusercontent\.com$/i,
  /a1b2c3d4e5f6g7h8i9/i,
];

export function resolveGoogleClientId(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return DEFAULT_GOOGLE_CLIENT_ID;
  if (!trimmed.endsWith(".apps.googleusercontent.com")) {
    return DEFAULT_GOOGLE_CLIENT_ID;
  }
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return DEFAULT_GOOGLE_CLIENT_ID;
  }

  return trimmed;
}
