export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000")
  .toString()
  .replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "erp.accessToken";

// ✅ NEW: branch selection key (same key used in AppHeader)
const BRANCH_ID_KEY = "erp.branchId";

function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// ✅ NEW: get selected branch id
function getBranchId() {
  return localStorage.getItem(BRANCH_ID_KEY);
}

function parseMessage(data: any): string {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message || data.error || "Request failed";
}

export async function http<T>(
  path: string,
  options: RequestInit & { auth?: boolean; json?: unknown } = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // ✅ NEW: attach selected branch to every request (if available)
  const branchId = getBranchId();
  if (branchId) {
    headers.set("X-Branch-Id", branchId);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const err: HttpError = {
      status: res.status,
      message: parseMessage(data),
      details: data,
    };
    throw err;
  }

  return data as T;
}
