import axios from "axios";
import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

const axiosPrivate = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

// Interceptor para agregar el token de Supabase a cada request
axiosPrivate.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
axiosPrivate.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado refrescar ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Supabase maneja el refresh automáticamente
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !session) {
          throw refreshError || new Error("No session after refresh");
        }

        // Actualiza el header con el nuevo token y reintenta la solicitud
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh → cerrar sesión y redirigir
        await supabase.auth.signOut();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    const normalizedError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

export { axiosPrivate };
export default authAxios;
