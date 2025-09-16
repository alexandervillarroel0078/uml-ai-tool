import axios from "axios";
import useAuth from "../store/auth";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const { token } = useAuth.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      try { useAuth.getState().logout(); } catch {}
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
