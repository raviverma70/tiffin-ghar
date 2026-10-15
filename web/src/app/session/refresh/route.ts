import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/api";
import { clearSession, getRefreshToken, safeNext, setSession } from "@/lib/session";

type RefreshResponse = { accessToken: string; refreshToken: string };

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as RefreshResponse;
        await setSession(data.accessToken, data.refreshToken);
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch {
      // backend tak nahi pahunche
    }
    // Refresh nahi hua (session khatam ya backend band): cookies hatao.
    // Isse redirect ka chakkar (loop) nahi banta, user guest ban jata hai.
    await clearSession();
  }

  return NextResponse.redirect(new URL(next, request.url));
}