import type { FileProps } from "@/components/uploader/ImageUploader";

export const ProductStatusValues = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export type ProductStatus =
  (typeof ProductStatusValues)[keyof typeof ProductStatusValues];

export type Product = {
  id: number;
  variant_id: number;
  name: string;
  price: string;
  capacity: number;
  unit: string;
  brand: string;
  barcode: string;
  status: ProductStatus;
};

export interface CatalogItem {
  id: number;
  description: string;
}

export interface UomItem extends CatalogItem {
  name: string;
}

export interface CategoryItem extends CatalogItem {
  name: string;
}

export interface BrandItem {
  id: number;
  name: string;
}

export interface BrandItemCreate {
  id: number | string;
  name: string;
}

export interface ProductForm {
  name: string;
  barcode: string;
  brand_id: number;
  capacity: number;
  unit_id: string;
  categories: string[];
  business_types: number[];
  quantity_per_package: number;
}

export interface ProductBaseForm {
  name: string;
  brand_id: number;
  categories: string[];
}

export interface ProductFormUserType extends ProductForm {
  stock_quantity: number;
  min_stock: number;
  status: ProductStatus;
  images: FileProps[];
  price: number;
  presentation?: string; // Presentación del producto (unidad, pack, etc.)
}

// Tipos para el nuevo flujo de creación
export interface BaseProduct {
  id: number;
  name: string;
  barcode?: string;
  brand_id?: number;
  brand?: BrandItem;
  categories?: CategoryItem[];
  business_types?: number[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  status: ProductStatus;
  barcode?: string;
  units: number;
  capacity?: number;
  uom_id?: number;
  uom?: UomItem;
}

export interface ProductVariantForm {
  product_base_id: number;
  presentation: string;
  capacity?: number;
  unit_id: string;
  quantity_per_package: number;
  barcode?: string;
  price: number;
  stock_quantity: number;
  min_stock: number;
  user_id: string;
}

export type FormState =
  | { step: "search"; productBaseId: null }
  | { step: "create-product-base"; productBaseId: null; searchTerm: string }
  | { step: "variant-exists"; productBaseId: number; variantId: number }
  | {
      step: "create-variant";
      productBaseId: number;
      variantId: null;
      showVariantForm?: boolean;
    };

export interface NewProductFormData {
  // Datos del producto base (si se crea nuevo)
  productBase?: {
    name: string;
    barcode?: string;
    brand_id: number;
    categories: number[];
    business_types: number[];
  };
  // Datos de la variante (si se crea nueva)
  variant?: {
    name: string;
    capacity?: number;
    units: number;
    uom_id?: number;
    barcode?: string;
    status: ProductStatus;
  };
  // Datos del usuario (siempre requeridos)
  userData: {
    variant_id?: number; // Si usa variante existente
    barcode?: string;
    price: number;
    stock_quantity: number;
    min_stock: number;
  };
}
