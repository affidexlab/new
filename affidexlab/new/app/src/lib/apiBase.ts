export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://decaflow-backend.onrender.com"
).trim().replace(/\/+$/, "");
