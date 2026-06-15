export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  // On the client (browser), use relative paths to leverage Next.js rewrites and avoid CORS.
  // On the server (SSR/Server Components), use the absolute BACKEND_URL.
  const prefix = typeof window === "undefined" ? BACKEND_URL : "";
  const url = path.startsWith("http") ? path : `${prefix}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include", // Crucial for cookie transmission
  });

  return response;
}

