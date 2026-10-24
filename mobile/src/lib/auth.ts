import { api, type ApiResult } from "./api";
import { clearTokens, getRefreshToken, saveTokens, type Tokens } from "./tokens";

export type User = {
  id: number;
  phone: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  language: string | null;
};

// Backend jaisi hi jaanch (phone: 6-9 se shuru, 10 digit)
export const PHONE_RE = /^[6-9]\d{9}$/;
export const OTP_RE = /^\d{6}$/;

export function sendOtp(phone: string) {
  return api<{ message: string }>("/auth/send-otp", { method: "POST", body: { phone } });
}

// OTP sahi ho to tokens phone ke secure storage me, aur user wapas
export async function verifyOtp(phone: string, code: string): Promise<ApiResult<User>> {
  const res = await api<Tokens & { user: User }>("/auth/verify-otp", { method: "POST", body: { phone, code } });
  if (!res.ok) return res;
  await saveTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
  return { ok: true, data: res.data.user };
}

// Token se user (expire ho to api() khud refresh karta hai)
export function fetchMe() {
  return api<User>("/me", { auth: true });
}

// Backend par refresh token band karo, phir phone se hatao (backend na mile tab bhi phone se hat jata hai)
export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) await api("/auth/logout", { method: "POST", body: { refreshToken } });
  await clearTokens();
}
