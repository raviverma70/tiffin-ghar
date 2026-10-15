import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
export const ACCESS_COOKIE = "tg_access";
export const REFRESH_COOKIE = "tg_refresh";

const ACCESS_MAX_AGE = 14 * 60; // JWT 15 min ka hai, cookie thoda pehle khatam
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 din

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true, // browser ka JavaScript padh nahi sakta
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setSession(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  store.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

// Redirect me sirf apni website ka raasta (open redirect se bachne ke liye)
export function safeNext(value: string | null | undefined) {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export type User = { id: number; phone: string; role: string };

export type Session =
  | { status: "user"; user: User }
  | { status: "refresh" } // access cookie nahi, par refresh cookie hai
  | { status: "guest" };

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (!access) return refresh ? { status: "refresh" } : { status: "guest" };

  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    if (!res.ok) return { status: "guest" };
    const body = await res.json();
    return { status: "user", user: (body.user ?? body) as User };
  } catch {
    return { status: "guest" };
  }
}

// Page ke liye: user ya null. Access token khatam ho par refresh route par bhej deta hai
// (cookie badalna page me nahi ho sakta, isliye route par jaate hain).
export async function getCurrentUser(returnTo: string): Promise<User | null> {
  const session = await getSession();
  if (session.status === "refresh") {
    redirect(`/session/refresh?next=${encodeURIComponent(returnTo)}`);
  }
  return session.status === "user" ? session.user : null;
}