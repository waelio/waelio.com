export interface AuthSession {
    email: string;
    name: string;
    picture: string;
}

export interface SessionTokenPayload extends AuthSession {
    exp: number;
}

export interface ApiErrorResponse {
    error: string;
}

export interface GoogleConfigResponse {
    googleClientId: string;
}

export interface GoogleAuthRequest {
    credential: string;
}

export interface GoogleAuthSuccessResponse {
    ok: true;
    user: string;
    email: string;
}

export interface MeResponse {
    user: string;
    name: string;
    email: string;
    picture: string | null;
}

export interface GoogleTokenInfo {
    aud?: string;
    email?: string;
    name?: string;
    picture?: string;
}
