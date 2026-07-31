export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v1/boards";

export const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  BACKEND_URL.replace(/\/api\/v1\/boards\/?$/, "");

export const GOOGLE_AUTH_URL = `${BACKEND_ORIGIN}/auth/google`;