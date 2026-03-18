import api from "./api";

export const login          = (data) => api.post("/auth/login",           data);
export const register       = (data) => api.post("/auth/register",        data);
export const logout         = ()     => api.post("/auth/logout");
export const refreshToken   = ()     => api.post("/auth/refresh");
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword  = (data) => api.post("/auth/reset-password",  data);

// Fire-and-forget logout — used by Navbar so it never blocks the UI
export const logoutService  = ()     => api.post("/auth/logout").catch(() => {});