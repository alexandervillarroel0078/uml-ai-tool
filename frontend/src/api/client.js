import axios from "axios";
import useAuth from "../store/auth";
import { API_URL } from "../config";

// 🔹 Se crea una instancia de Axios con configuración base
const api = axios.create({
  baseURL: API_URL,  // 👉 todas las peticiones usarán este prefijo
  timeout: 10000,    // 👉 10 segundos de espera máxima por request
});

// ====== INTERCEPTOR DE REQUEST ======
api.interceptors.request.use((config) => {
  // Obtiene el token guardado en el store de autenticación
  const { token } = useAuth.getState();

  // Si hay token, lo añade al header como "Authorization: Bearer ..."
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; // devuelve la configuración final de la request
});

// ====== INTERCEPTOR DE RESPONSE ======
api.interceptors.response.use(
  (r) => r, // ✅ si la respuesta es exitosa, la deja pasar tal cual
  (err) => {
    // ❌ Si la API responde 401 (no autorizado)
    if (err?.response?.status === 401) {
      try { 
        // Intenta ejecutar logout desde el store
        useAuth.getState().logout(); 
      } catch {}
      
      // Redirige al usuario a la página de login
      window.location.href = "/login";
    }
    // Rechaza la promesa para que el error pueda ser capturado después
    return Promise.reject(err);
  }
);

export default api; // 👉 se exporta la instancia lista para usar
