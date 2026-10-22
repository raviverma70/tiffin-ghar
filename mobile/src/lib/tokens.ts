import * as SecureStore from "expo-secure-store";

// Tokens phone ke secure storage me (Android Keystore / iOS Keychain), AsyncStorage me nahi
const ACCESS_KEY = "tg_access";
const REFRESH_KEY = "tg_refresh";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function saveTokens(tokens: Tokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
}
