import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

const axiosPrivate = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado refrescar ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Llama al endpoint refresh del backend (usa cookie refreshToken)
        const res = await authAxios.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        // Guarda nuevo access token
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        // Actualiza header y repite la solicitud original
        axiosPrivate.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh → limpiar sesión y redirigir
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosPrivate };
export default authAxios;
