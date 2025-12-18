import { axiosPrivate } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Client } from "../sales.type";

/**
 * Hook para buscar clientes por DNI
 * @param dni - DNI del cliente a buscar
 * @param enabled - Si la búsqueda está habilitada
 * @returns Query result con los clientes encontrados
 */
export const useClientSearch = (dni: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["client-search", dni],
    queryFn: async () => {
      const res = await axiosPrivate.get<Client | Client[]>("/client", {
        params: {
          DNI: dni,
        },
      });
      // Normalizar la respuesta: puede venir como objeto único o como array
      const data = res.data;
      if (Array.isArray(data)) {
        return data;
      }
      return [data];
    },
    enabled: enabled && dni.trim().length > 0,
    staleTime: 30000, // 30 segundos
    retry: false, // No reintentar si falla la búsqueda
  });
};
