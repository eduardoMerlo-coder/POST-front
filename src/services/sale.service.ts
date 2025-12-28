import { supabase } from "@/lib/supabaseClient";
import type { SelectedProduct } from "@/modules/sales/sales.type";

export interface CreateSaleDto {
  user_id: string;
  client_id: number | null;
  document_type: "B" | "F" | "NVT";
  subtotal: number;
  total_amount: number;
  items: SelectedProduct[];
  payments: Array<{
    payment_method: "CONTADO" | "YAPE" | "TRANSFERENCIA" | "CREDITO";
    amount: number;
    reference_number?: string;
  }>;
  tax_amount?: number;
  discount_amount?: number;
  change_amount?: number;
  status?: "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED";
  comments?: string;
}

export interface Sale {
  id: number;
  user_id: string;
  client_id: number | null;
  document_type: "B" | "F" | "NVT";
  document_number: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  change_amount: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED";
  comments: string | null;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
  payments?: SalePayment[];
  client?: {
    id: number;
    name: string;
    last_name?: string | null;
  } | null;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  user_product_variant_id: number;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  created_at: string;
}

export interface SalePayment {
  id: number;
  sale_id: number;
  payment_method: "CONTADO" | "YAPE" | "TRANSFERENCIA" | "CREDITO";
  amount: number;
  reference_number: string | null;
  created_at: string;
}

class SaleService {
  /**
   * Crear una nueva venta usando la función RPC create_sale
   */
  async createSale(data: CreateSaleDto): Promise<Sale> {
    // Preparar items para la función RPC
    const items = data.items.map((item) => ({
      user_product_variant_id: item.user_product_variant_id,
      product_name: item.name,
      variant_name: item.capacity && item.unit 
        ? `${item.capacity} ${item.unit}` 
        : null,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      discount_amount: 0, // Por ahora sin descuentos por item
    }));

    // Preparar pagos para la función RPC
    const payments = data.payments.map((payment) => ({
      payment_method: payment.payment_method,
      amount: payment.amount,
      reference_number: payment.reference_number || null,
    }));

    // Llamar a la función RPC
    const { data: result, error } = await supabase.rpc("create_sale", {
      p_user_id: data.user_id,
      p_client_id: data.client_id,
      p_document_type: data.document_type,
      p_subtotal: data.subtotal,
      p_total_amount: data.total_amount,
      p_items: items as any,
      p_payments: payments as any,
      p_tax_amount: data.tax_amount ?? 0,
      p_discount_amount: data.discount_amount ?? 0,
      p_change_amount: data.change_amount ?? 0,
      p_status: data.status ?? "COMPLETED",
      p_comments: data.comments ?? null,
    });

    if (error) {
      console.error("Error creating sale:", error);
      throw new Error(
        error.message ||
          error.details ||
          error.hint ||
          "Error al crear la venta"
      );
    }

    return result as Sale;
  }

  /**
   * Obtener una venta por ID
   */
  async getSaleById(saleId: number): Promise<Sale | null> {
    const { data, error } = await supabase
      .from("sale")
      .select(
        `
        *,
        items:sale_item(*),
        payments:sale_payment(*),
        client:client_id(id, name, last_name)
      `
      )
      .eq("id", saleId)
      .single();

    if (error) {
      console.error("Error fetching sale:", error);
      throw new Error(error.message);
    }

    return data as Sale | null;
  }

  /**
   * Agregar un pago parcial a una venta a crédito
   */
  async addCreditPayment(
    saleId: number,
    amount: number,
    paymentMethod: "CONTADO" | "YAPE" | "TRANSFERENCIA" | "CREDITO" = "CONTADO",
    referenceNumber?: string
  ): Promise<Sale & { total_paid: number; remaining: number }> {
    const { data: result, error } = await supabase.rpc("add_credit_payment", {
      p_sale_id: saleId,
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_reference_number: referenceNumber || null,
    });

    if (error) {
      console.error("Error adding credit payment:", error);
      throw new Error(
        error.message ||
          error.details ||
          error.hint ||
          "Error al agregar pago de crédito"
      );
    }

    return result as Sale & { total_paid: number; remaining: number };
  }

  /**
   * Obtener ventas de un usuario con paginación, búsqueda por cliente y filtro por estado
   */
  async getUserSales(
    user_id: string,
    page: number = 1,
    per_page: number = 20,
    clientSearch?: string,
    statusFilter?: string | null
  ): Promise<{ sales: Sale[]; total: number }> {
    let query = supabase
      .from("sale")
      .select(
        `
        *,
        items:sale_item(*),
        payments:sale_payment(*),
        client:client_id(id, name, last_name)
      `,
        { count: "exact" }
      )
      .eq("user_id", user_id);

    // Filtrar por estado si se especifica
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    // Obtener todas las ventas (sin paginación) para poder filtrar por cliente
    // Si no hay búsqueda ni filtro de estado, aplicamos paginación directamente en la query
    const needsClientFilter = clientSearch && clientSearch.trim().length > 0;
    const { data, error, count } = needsClientFilter
      ? await query.order("created_at", { ascending: false })
      : await query
          .order("created_at", { ascending: false })
          .range((page - 1) * per_page, page * per_page - 1);

    if (error) {
      console.error("Error fetching sales:", error);
      throw new Error(error.message);
    }

    let filteredSales = (data as Sale[]) || [];
    let filteredTotal = count || 0;

    // Filtrar por cliente si hay búsqueda
    if (clientSearch && clientSearch.trim().length > 0) {
      const searchLower = clientSearch.toLowerCase().trim();
      filteredSales = filteredSales.filter((sale) => {
        if (!sale.client) {
          // Si no hay cliente, es cliente genérico
          return "cliente generico".includes(searchLower);
        }
        const clientName = `${sale.client.name}${sale.client.last_name ? ` ${sale.client.last_name}` : ""}`.toLowerCase();
        return clientName.includes(searchLower);
      });
      filteredTotal = filteredSales.length;
      
      // Aplicar paginación después del filtrado
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + per_page;
      filteredSales = filteredSales.slice(startIndex, endIndex);
    }

    return {
      sales: filteredSales,
      total: filteredTotal,
    };
  }
}

export const saleService = new SaleService();

