import { request } from "./client.js";
export const getCurrentUser = (signal) => request("/auth/me", { signal });
export const logout = () => request("/auth/logout", { method: "POST" });
export const login = (username, password) =>
  request("/auth/login", { method: "POST", body: { username, password } });
