/** Backend API base URL. Empty in dev = Vite proxy to localhost:3000 */
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
