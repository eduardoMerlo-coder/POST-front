import { axiosPrivate } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BrandItem,
  Product,
  ProductForm,
  ProductFormUserType,
  BaseProduct,
  ProductVariant,
} from "../product.type";
import type { UomItem, CategoryItem } from "../product.type";

export const useApiQuery = <T>(key: string, url: string) => {
  const oneDayInMs = 60 * 60 * 24 * 1000; // 1 día en milisegundos
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const res = await axiosPrivate.get<T>(url);
      return res.data;
    },
    staleTime: oneDayInMs, // Los datos se consideran frescos por 1 día
    gcTime: oneDayInMs, // Los datos permanecen en caché por 1 día
  });
};

export const useGetAllUom = () => useApiQuery<UomItem[]>("list-uom", "/uom");

export const useGetAllCategories = () =>
  useApiQuery<CategoryItem[]>("product-categories", "/category");

export const useGetBrands = () =>
  useApiQuery<BrandItem[]>("product-brand", "/brand");

export const useGetAllBaseProducts = (
  page: number,
  per_page: number,
  searchTerm: string
) => {
  return useQuery({
    queryKey: ["all-base-products", page, per_page, searchTerm],
    queryFn: () =>
      axiosPrivate
        .get<{ products: Product[]; total: number }>("/base-products", {
          params: {
            page,
            per_page,
            searchTerm,
            sort: "name",
            order: "asc",
          },
        })
        .then((res) => res.data),
    initialData: { products: [], total: 0 },
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: ProductForm) =>
      axiosPrivate.post("/product-base", { ...data }),
  });
};

export const useCreateProductVariant = () => {
  return useMutation({
    mutationFn: (data: ProductFormUserType) =>
      axiosPrivate.post("/product-variant", { ...data }),
  });
};

export const useCreateUserProductVariant = () => {
  return useMutation({
    mutationFn: (data: {
      variant_id: number;
      barcode?: string;
      price: number;
      stock_quantity: number;
      min_stock: number;
      user_id: string;
    }) => axiosPrivate.post("/user-product-variant", { ...data }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductForm }) =>
      axiosPrivate.put(`/product-base/${id}`, { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-base-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-base"] });
    },
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      axiosPrivate.post("/brand", { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brand"] });
    },
  });
};

export const useGetBaseProductById = (id: number) => {
  return useQuery({
    queryKey: ["product-base", id],
    queryFn: () => axiosPrivate.get<Product>(`/product-base/${id}`),
  });
};

export const useSearchBaseProducts = (
  searchTerm: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["search-base-products", searchTerm],
    queryFn: () =>
      axiosPrivate
        .get<{ products: BaseProduct[]; total: number }>("/base-products", {
          params: {
            page: 1,
            per_page: 20,
            searchTerm,
            sort: "name",
            order: "asc",
          },
        })
        .then((res) => res.data),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 30000, // 30 segundos
  });
};

export const useGetVariantsByProductId = (
  productId: number | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const res = await axiosPrivate.get<ProductVariant[]>(
        `/product-base/${productId}/variants`
      );
      return res.data;
    },
    enabled: enabled && productId !== null && productId > 0,
    staleTime: 60000, // 1 minuto
  });
};
