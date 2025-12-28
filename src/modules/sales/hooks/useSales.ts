import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saleService, type CreateSaleDto, type Sale } from "@/services/sale.service";
import { clientService } from "@/services/client.service";
import { toast } from "react-toastify";

/**
 * Hook para crear una nueva venta
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleDto) => saleService.createSale(data),
    onSuccess: (sale: Sale) => {
      // Invalidar la caché de ventas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success(`Venta ${sale.document_number || sale.id} creada exitosamente`);
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.error_description ||
        "Error al crear la venta";
      toast.error(message);
      console.error("Error creating sale:", error);
    },
  });
};

/**
 * Hook para obtener una venta por ID
 */
export const useGetSaleById = (saleId: number | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["sale", saleId],
    queryFn: async () => {
      if (!saleId) throw new Error("Sale ID is required");
      return saleService.getSaleById(saleId);
    },
    enabled: enabled && saleId !== null && saleId > 0,
    staleTime: 60000, // 1 minuto
  });
};

/**
 * Hook para obtener las ventas de un usuario
 */
export const useGetUserSales = (
  user_id: string | null,
  page: number = 1,
  per_page: number = 20,
  clientSearch?: string,
  statusFilter?: string | null
) => {
  return useQuery({
    queryKey: ["sales", user_id, page, per_page, clientSearch, statusFilter],
    queryFn: async () => {
      if (!user_id) throw new Error("User ID is required");
      return saleService.getUserSales(user_id, page, per_page, clientSearch, statusFilter);
    },
    enabled: !!user_id,
    staleTime: 30000, // 30 segundos
  });
};

/**
 * Hook para agregar un pago parcial a una venta a crédito
 */
export const useAddCreditPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      saleId: number;
      amount: number;
      paymentMethod?: "CONTADO" | "YAPE" | "TRANSFERENCIA" | "CREDITO";
      referenceNumber?: string;
    }) =>
      saleService.addCreditPayment(
        data.saleId,
        data.amount,
        data.paymentMethod || "CONTADO",
        data.referenceNumber
      ),
    onSuccess: (updatedSale, variables) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["sale", variables.saleId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      if (updatedSale.status === "COMPLETED") {
        toast.success("¡Venta completada! El crédito ha sido pagado en su totalidad.");
      } else {
        toast.success(`Pago de S/ ${variables.amount.toFixed(2)} registrado exitosamente.`);
      }
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.error_description ||
        "Error al registrar el pago";
      toast.error(message);
      console.error("Error adding credit payment:", error);
    },
  });
};

/**
 * Hook para buscar clientes por nombre o documento
 * @param searchTerm - Término de búsqueda (nombre, apellido o documento)
 * @param enabled - Si la búsqueda está habilitada
 * @param user_id - ID del usuario para filtrar clientes
 * @returns Query result con los clientes encontrados
 */
export const useClientSearch = (
  searchTerm: string,
  enabled: boolean = true,
  user_id: string | null = null
) => {
  return useQuery({
    queryKey: ["client-search", searchTerm, user_id],
    queryFn: async () => {
      if (!user_id) {
        return [];
      }
      const clients = await clientService.searchClients(searchTerm, user_id);
      return clients;
    },
    enabled: enabled && searchTerm.trim().length > 0 && !!user_id,
    staleTime: 30000, // 30 segundos
    retry: false, // No reintentar si falla la búsqueda
  });
};

/**
 * Hook para obtener o crear el cliente genérico para el usuario actual.
 * Se usa para asegurar que siempre exista un "CLIENTE GENERICO" en la BD.
 */
export const useGenericClient = (user_id: string | null) => {
  return useQuery({
    queryKey: ["generic-client", user_id],
    queryFn: async () => {
      if (!user_id) {
        throw new Error("User ID is required to get or create generic client.");
      }
      return await clientService.getOrCreateGenericClient(user_id);
    },
    enabled: !!user_id,
    staleTime: Infinity, // El cliente genérico no cambia, se considera siempre fresco
    gcTime: Infinity, // No se recolecta de la caché
    retry: false, // Si falla la creación/obtención, no reintentar automáticamente
  });
};
