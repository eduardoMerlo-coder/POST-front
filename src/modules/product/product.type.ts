type ProductStatus = "active" | "inactive";

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
  unit: string;
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

export type ProductForm = {
  name: string;
  internal_code: string;
  barcode: string;
  brand_id: number;
  packaging_type_id: number | undefined;
  capacity: number;
  unit_id: string;
  categories: string[];
  business_types: number[];
};
