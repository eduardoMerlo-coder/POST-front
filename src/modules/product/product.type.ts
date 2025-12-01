import type { FileProps } from "@/components/uploader/ImageUploader";

export const ProductStatusValues = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE"
};

export type ProductStatus = typeof ProductStatusValues[keyof typeof ProductStatusValues];

export type Product = {
  id: number;
  name: string;
  price: string;
  capacity: number;
  unit: {
    name: string;
  };
  internal_code: string;
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
export interface PackagingTypeItem extends CatalogItem {
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
  internal_code: string;
  barcode: string;
  brand_id: number;
  packaging_type_id: number | undefined;
  capacity: number;
  unit_id: string;
  categories: string[];
  business_types: number[];
  quantity_per_package: number;
};

export interface ProductFormUserType extends ProductForm {
  stock_quantity: number;
  min_stock: number;
  status: ProductStatus;
  images: FileProps[];
  price: number;
}