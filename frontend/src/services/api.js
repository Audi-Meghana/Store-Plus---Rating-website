import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  refreshQueue = [];
};

// These URLs never need a token refresh — skip the retry logic entirely
const SKIP_REFRESH_URLS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",   // ✅ KEY FIX: logout must never trigger a refresh attempt
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url      = original?.url ?? "";

    const shouldSkip = SKIP_REFRESH_URLS.some((u) => url.includes(u));

    if (error.response?.status === 401 && !original._retry && !shouldSkip) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              original.headers.Authorization = "Bearer " + token;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw new Error("No token");

        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common.Authorization = "Bearer " + newToken;
        processQueue(null, newToken);
        original.headers.Authorization = "Bearer " + newToken;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        import("../store/authStore").then(({ default: useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        // eslint-disable-next-line no-undef
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;