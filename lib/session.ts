import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "decenteye_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-secret-change-me"
);

export interface SessionPayload {
  email: string;
  name: string;
}

export function nameFromEmail(email: string) {
  return email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
}

export async function createSession(email: string, name: string) {
  const token = await new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}