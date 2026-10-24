import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onSessionEnded, type ApiResult } from "@/lib/api";
import { fetchMe, logout as logoutApi, verifyOtp, type User } from "@/lib/auth";
import { getRefreshToken } from "@/lib/tokens";
import { useSyncLanguage } from "@/i18n";

// loading: app khulte hi token check ho raha hai
// offline: token hai par backend tak nahi pahunche (login bana hai, dobara try karo)
type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "offline" }
  | { status: "user"; user: User };

type Ctx = {
  state: AuthState;
  user: User | null;
  login: (phone: string, code: string) => Promise<ApiResult<User>>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const syncLanguage = useSyncLanguage();

  const reload = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      setState({ status: "guest" });
      return;
    }
    const res = await fetchMe();
    if (res.ok) setState({ status: "user", user: res.data });
    else if (res.status === 0 || res.status === 429 || res.status >= 500) setState({ status: "offline" });
    else setState({ status: "guest" }); // token bekaar (api() tokens hata chuka hai)
  }, []);

  // App khulte hi: pehle se login hai?
  useEffect(() => {
    void reload();
  }, [reload]);

  // Kisi bhi screen par session khatam hua (refresh token bekaar): guest
  useEffect(() => onSessionEnded(() => setState({ status: "guest" })), []);

  const login = useCallback(
    async (phone: string, code: string) => {
      const res = await verifyOtp(phone, code);
      if (res.ok) {
        setState({ status: "user", user: res.data });
        syncLanguage(res.data.language);
      }
      return res;
    },
    [syncLanguage],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setState({ status: "guest" });
  }, []);

  const value = useMemo(
    () => ({ state, user: state.status === "user" ? state.user : null, login, logout, reload }),
    [state, login, logout, reload],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ko AuthProvider ke andar use karo");
  return ctx;
}
