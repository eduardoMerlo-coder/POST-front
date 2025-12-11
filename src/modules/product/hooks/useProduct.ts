import { axiosPrivate } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BrandItem,
  Product,
  ProductForm,
  ProductBaseForm,
  ProductVariantForm,
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

export const useGetCategories = (
  page: number,
  per_page: number,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ["categories-paginated", page, per_page, searchTerm],
    queryFn: async () => {
      try {
        // Intentar obtener con paginación
        const res = await axiosPrivate.get<{
          categories?: CategoryItem[];
          category?: CategoryItem[]; // Por si viene como 'category'
          data?: CategoryItem[]; // Por si viene como 'data'
          total?: number;
        }>("/category", {
          params: {
            page,
            per_page,
            searchTerm: searchTerm || undefined,
            sort: "name",
            order: "asc",
          },
        });

        const data = res.data;

        // Si la respuesta tiene el formato paginado esperado
        if (data.total !== undefined) {
          return {
            categories: data.categories || data.category || data.data || [],
            total: data.total,
          };
        }

        // Si es un array directo, hacer paginación del lado del cliente
        let allCategories = Array.isArray(data)
          ? data
          : data.categories || data.category || data.data || [];

        // Filtrar por searchTerm si existe (búsqueda del lado del cliente)
        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          allCategories = allCategories.filter(
            (cat: CategoryItem) =>
              cat.name.toLowerCase().includes(searchLower) ||
              (cat.description &&
                cat.description.toLowerCase().includes(searchLower))
          );
        }

        const startIndex = (page - 1) * per_page;
        const endIndex = startIndex + per_page;
        const paginatedCategories = allCategories.slice(startIndex, endIndex);

        return {
          categories: paginatedCategories,
          total: allCategories.length,
        };
      } catch {
        // Si falla, intentar obtener todas las categorías
        const res = await axiosPrivate.get<
          | CategoryItem[]
          | {
              categories?: CategoryItem[];
              category?: CategoryItem[];
              data?: CategoryItem[];
            }
        >("/category");

        let allCategories = Array.isArray(res.data)
          ? res.data
          : (res.data as any).categories ||
            (res.data as any).category ||
            (res.data as any).data ||
            [];

        // Filtrar por searchTerm si existe (búsqueda del lado del cliente)
        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          allCategories = allCategories.filter(
            (cat: CategoryItem) =>
              cat.name.toLowerCase().includes(searchLower) ||
              (cat.description &&
                cat.description.toLowerCase().includes(searchLower))
          );
        }

        const startIndex = (page - 1) * per_page;
        const endIndex = startIndex + per_page;
        const paginatedCategories = allCategories.slice(startIndex, endIndex);

        return {
          categories: paginatedCategories,
          total: allCategories.length,
        };
      }
    },
    initialData: { categories: [], total: 0 },
  });
};

export const useGetBrands = () =>
  useApiQuery<BrandItem[]>("product-brand", "/brand");

export const useGetBrandsPaginated = (
  page: number,
  per_page: number,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ["brands-paginated", page, per_page, searchTerm],
    queryFn: async () => {
      try {
        // Intentar obtener con paginación del servidor
        const res = await axiosPrivate.get<
          | {
              brands?: BrandItem[];
              brand?: BrandItem[];
              data?: BrandItem[];
              total?: number;
            }
          | BrandItem[]
        >("/brand", {
          params: {
            page,
            per_page,
            searchTerm: searchTerm || undefined,
            sort: "name",
            order: "asc",
          },
        });

        const responseData = res.data;

        // Si la respuesta tiene el formato paginado esperado (con total)
        if (!Array.isArray(responseData) && responseData.total !== undefined) {
          return {
            brands:
              responseData.brands ||
              responseData.brand ||
              responseData.data ||
              [],
            total: responseData.total,
          };
        }

        // Si es un array directo o no tiene paginación, usar todos los datos
        // y hacer paginación del lado del cliente
        let allBrands = Array.isArray(responseData)
          ? responseData
          : responseData.brands ||
            responseData.brand ||
            responseData.data ||
            [];

        // Filtrar por searchTerm si existe (búsqueda del lado del cliente)
        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          allBrands = allBrands.filter((brand: BrandItem) =>
            brand.name.toLowerCase().includes(searchLower)
          );
        }

        // Paginación del lado del cliente
        const startIndex = (page - 1) * per_page;
        const endIndex = startIndex + per_page;
        const paginatedBrands = allBrands.slice(startIndex, endIndex);

        return {
          brands: paginatedBrands,
          total: allBrands.length,
        };
      } catch {
        // Si falla la petición con parámetros, obtener todas las marcas
        const res = await axiosPrivate.get<BrandItem[]>("/brand");
        let allBrands = Array.isArray(res.data) ? res.data : [];

        // Filtrar por searchTerm si existe (búsqueda del lado del cliente)
        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          allBrands = allBrands.filter((brand: BrandItem) =>
            brand.name.toLowerCase().includes(searchLower)
          );
        }

        // Paginación del lado del cliente
        const startIndex = (page - 1) * per_page;
        const endIndex = startIndex + per_page;
        const paginatedBrands = allBrands.slice(startIndex, endIndex);

        return {
          brands: paginatedBrands,
          total: allBrands.length,
        };
      }
    },
    initialData: { brands: [], total: 0 },
  });
};

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

export const useGetUserProducts = (
  page: number,
  per_page: number,
  searchTerm: string,
  user_id: string | null
) => {
  return useQuery({
    queryKey: ["user-products", page, per_page, searchTerm, user_id],
    queryFn: async () => {
      const res = await axiosPrivate.get<{
        products: Product[];
        total: number;
      }>("/user-products", {
        params: {
          page,
          per_page,
          searchTerm,
          sort: "name",
          order: "asc",
          user_id: user_id || undefined,
        },
      });
      return res.data;
    },
    enabled: !!user_id,
    initialData: { products: [], total: 0 },
  });
};

export const useCreateProductBase = () => {
  return useMutation({
    mutationFn: (data: ProductBaseForm) =>
      axiosPrivate.post("/product-base", { ...data }),
  });
};

export const useCreateProductVariant = () => {
  return useMutation({
    mutationFn: (data: ProductVariantForm) =>
      axiosPrivate.post("/product-variant", { ...data }),
  });
};

export const useCreateUserProductVariant = () => {
  return useMutation({
    mutationFn: (data: {
      product_base_id: number;
      variant_id: number;
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

export const useUpdateUserProductPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variant_id,
      user_id,
      price,
    }: {
      variant_id: number;
      user_id: string;
      price: number;
    }) =>
      axiosPrivate.put(`/user-product-variant/${variant_id}`, {
        variant_id,
        user_id,
        price,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    },
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        variant_id: number;
        presentation?: string;
        capacity?: number;
        unit_id?: string;
        units?: number;
        barcode?: string;
      };
    }) => axiosPrivate.put(`/product-variant/${id}`, { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-base"] });
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
    },
  });
};

export const useUpdateUserProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      user_product_variant_id,
      data,
    }: {
      user_product_variant_id: number;
      data: {
        price?: number;
        stock_quantity?: number;
        min_stock?: number;
      };
    }) =>
      axiosPrivate.put(`/user-product-variant/${user_product_variant_id}`, {
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
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
      // Invalidar todas las queries relacionadas con marcas
      queryClient.invalidateQueries({ queryKey: ["product-brand"] });
      queryClient.invalidateQueries({ queryKey: ["brands-paginated"] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      axiosPrivate.put(`/brand/${id}`, { ...data }),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con marcas
      queryClient.invalidateQueries({ queryKey: ["product-brand"] });
      queryClient.invalidateQueries({ queryKey: ["brands-paginated"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      axiosPrivate.post("/category", { ...data }),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con categorías
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; description: string };
    }) => axiosPrivate.put(`/category/${id}`, { ...data }),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con categorías
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
    },
  });
};

export const useGetBaseProductById = (id: number) => {
  return useQuery({
    queryKey: ["product-base", id],
    queryFn: () =>
      axiosPrivate.get<ProductVariant>(`/user-product-variant/${id}`),
  });
};

export const useCheckUserProductExists = (
  variantId: number | null,
  userId: string | null,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ["check-user-product", variantId, userId],
    queryFn: async () => {
      if (!variantId || !userId) {
        return false;
      }
      try {
        const res = await axiosPrivate.get<{ exists: boolean }>(
          `/user-product-variant/check`,
          {
            params: {
              variant_id: variantId,
              user_id: userId,
            },
          }
        );
        return res.data.exists;
      } catch {
        // Si el endpoint no existe o falla, intentar otra forma
        // Buscar en la lista de productos del usuario
        try {
          const res = await axiosPrivate.get<{
            products: Product[];
            total: number;
          }>("/user-products", {
            params: {
              page: 1,
              per_page: 1000,
              searchTerm: "",
              user_id: userId,
            },
          });
          const exists =
            res.data.products.some(
              (p: Product) => p.variant_id === variantId
            ) || false;
          return exists;
        } catch {
          return false;
        }
      }
    },
    enabled: enabled && !!variantId && !!userId,
    retry: false,
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
