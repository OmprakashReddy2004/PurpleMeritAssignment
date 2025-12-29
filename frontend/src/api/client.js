import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const PUBLIC_PATHS = [
  "/api/auth/login/",
  "/api/auth/signup/",
  "/api/auth/login",
  "/api/auth/signup",
];

api.interceptors.request.use((config) => {
  const url = config.url || "";

  // Don't attach Authorization for public auth endpoints
  if (PUBLIC_PATHS.some((p) => url.startsWith(p))) {
    if (config.headers?.Authorization) delete config.headers.Authorization;
    return config;
  }

  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export default api;
