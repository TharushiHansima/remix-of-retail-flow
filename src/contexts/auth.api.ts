import { api } from "@/lib/api";
import type { LoginResponse, MeResponse, RegisterPayload } from "./auth.types";

export function register(payload: RegisterPayload) {
  return api<LoginResponse>("/auth/register", {
    method: "POST",
    json: payload,
  });
}

export function login(payload: { email: string; password: string }) {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    json: payload,
  });
}

export function me() {
  return api<MeResponse>("/auth/me", { auth: true });
}
