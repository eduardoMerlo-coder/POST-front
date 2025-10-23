import { QueryClient } from "@tanstack/react-query";

const baseURL = import.meta.env.VITE_BASE_URL;

const customFetcher = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: "include",
  };

  const response = await fetch(`${baseURL}${url}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(`${baseURL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          localStorage.setItem("accessToken", accessToken);

          // Reintentar con el nuevo token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          };
          return fetch(`${baseURL}${url}`, retryConfig).then((r) => r.json());
        } else {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => customFetcher(queryKey[0] as string),
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error.message.includes("401")) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      mutationFn: (variables: any) =>
        customFetcher(variables.url, {
          method: "POST",
          body: JSON.stringify(variables.data ?? {}),
        }),
    },
  },
});
