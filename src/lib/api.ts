export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000")
  .toString()
  .replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "erp.accessToken";
const REFRESH_TOKEN_KEY = "erp.refreshToken";
const BRANCH_ID_KEY = "erp.branchId";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getBranchId() {
  return localStorage.getItem(BRANCH_ID_KEY);
}

export function setTokens(tokens: { accessToken: string; refreshToken?: string }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function extractMessage(data: any): string {
  // NestJS typical error shape: { statusCode, message, error }
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message || data.error || "Request failed";
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean; json?: unknown } = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const branchId = getBranchId();
  if (branchId) headers.set("X-Branch-Id", branchId);

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: extractMessage(data),
      details: data,
    };
    throw err;
  }

  return data as T;
}
