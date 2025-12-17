/**
 * Tipos para el módulo de ventas
 */

export interface AccountReceivable {
  id: number;
  cliente: string;
  monto_debe_pagar: number;
}

export interface SelectedProduct {
  id: number;
  variant_id: number;
  product_id: number;
  user_product_variant_id: number;
  name: string;
  price: number;
  quantity: number; // Ahora puede ser decimal (0.5, 0.25, etc.)
  capacity?: number;
  unit?: string;
  brand?: string;
  barcode?: string;
  // Modo de entrada: 'quantity' (por cantidad) o 'amount' (por monto fijo)
  inputMode?: "quantity" | "amount";
  // Monto fijo cuando inputMode es 'amount'
  fixedAmount?: number;
  stock_quantity?: number;
}
