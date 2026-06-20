import { createHmac, timingSafeEqual } from "crypto";

import { Env } from "@/constants/env";

export const AUTH_TOKEN_COOKIE_NAME = "auth-token";

export type AuthUser = {
  id?: string | number;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

export class AuthenticationError extends Error {
  status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

const TOKEN_COOKIE_NAMES = [AUTH_TOKEN_COOKIE_NAME, "token"];
const JWT_ALGORITHM = "HS256";

export async function AuthenticatinNeed(request: Request): Promise<AuthUser> {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new AuthenticationError("Missing authentication token");
  }

  return verifyJwtToken(token);
}

export function authErrorResponse(error: unknown) {
  const message = error instanceof AuthenticationError ? error.message : "Authentication failed";

  return Response.json({ message }, { status: 401 });
}

export function createAuthToken(user: AuthUser) {
  const expiresInSeconds = getAuthTokenMaxAgeSeconds();
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const payload = {
    ...user,
    exp: expiresAt,
  };
  const encodedHeader = encodeJwtPart(header);
  const encodedPayload = encodeJwtPart(payload);
  const signature = signJwtParts(encodedHeader, encodedPayload, Env.JWT_SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function getAuthTokenMaxAgeSeconds() {
  return Env.JWT_EXPIRES_IN_DAYS * 24 * 60 * 60;
}

function getTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);

  return TOKEN_COOKIE_NAMES.map((name) => cookies.get(name)).find(Boolean);
}

function verifyJwtToken(token: string): AuthUser {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new AuthenticationError("Invalid authentication token");
  }

  const header = parseJwtPart<{ alg?: string }>(encodedHeader);

  if (header.alg !== JWT_ALGORITHM) {
    throw new AuthenticationError("Unsupported authentication token");
  }

  const expectedSignature = signJwtParts(encodedHeader, encodedPayload, Env.JWT_SECRET);

  if (!safeEqual(signature, expectedSignature)) {
    throw new AuthenticationError("Invalid authentication token");
  }

  const payload = parseJwtPart<AuthUser & { exp?: number }>(encodedPayload);

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    throw new AuthenticationError("Authentication token expired");
  }

  return payload;
}

function signJwtParts(encodedHeader: string, encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
}

function encodeJwtPart(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function parseJwtPart<T>(value: string): T {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    throw new AuthenticationError("Invalid authentication token");
  }
}

function safeEqual(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedValue);

  return (
    valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (!name) {
      return;
    }

    cookies.set(name, decodeURIComponent(valueParts.join("=")));
  });

  return cookies;
}
