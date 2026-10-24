import { NextResponse, type NextRequest } from "next/server";
import { clearSession, getRefreshToken, REFRESH_WAIT_COOKIE, safeNext, setSession } from "@/lib/session";
import { refreshOnce } from "@/lib/refresh";

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const refreshToken = await getRefreshToken();
  const response = NextResponse.redirect(new URL(next, request.url));

  if (refreshToken) {
    // Do request ek saath aayein to bhi backend ko ek hi refresh jata hai (lib/refresh.ts)
    const result = await refreshOnce(refreshToken);

    if (result.ok) {
      await setSession(result.accessToken, result.refreshToken);
    } else if (result.reason === "network") {
      // Backend abhi band/restart: login mat mitao. Thodi der "mehmaan" jaisa dikhao,
      // taaki page baar-baar yahan na aaye (redirect ka chakkar na bane).
      response.cookies.set(REFRESH_WAIT_COOKIE, "1", { path: "/", maxAge: 15, httpOnly: true, sameSite: "lax" });
    } else {
      // Session sach me khatam: cookies hatao, user guest ban jata hai
      await clearSession();
    }
  }

  return response;
}
