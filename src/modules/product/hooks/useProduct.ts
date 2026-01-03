import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { catalogService } from "@/services/catalog.service";
import { uomService } from "@/services/uom.service";
import type {
  BrandItem,
  ProductForm,
  ProductBaseForm,
  ProductVariantForm,
} from "../product.type";

export const useGetAllUom = () => {
  const oneDayInMs = 60 * 60 * 24 * 1000; // 1 día en milisegundos
  return useQuery({
    queryKey: ["list-uom"],
    queryFn: async () => {
      return await uomService.getAllUoms();
    },
    staleTime: oneDayInMs,
    gcTime: oneDayInMs,
  });
};

export const useGetAllCategories = (user_id: string | null) => {
  return useQuery({
    queryKey: ["product-categories", user_id],
    queryFn: async () => {
      if (!user_id) {
        throw new Error("user_id is required");
      }
      const result = await catalogService.getAllCategories(1, 1000, user_id);
      return result.categories;
    },
    enabled: !!user_id,
    staleTime: 60 * 60 * 24 * 1000, // 1 día en milisegundos
    gcTime: 60 * 60 * 24 * 1000, // 1 día en milisegundos
  });
};

export const useGetCategories = (
  page: number,
  per_page: number,
  user_id: string | null,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ["categories-paginated", page, per_page, user_id, searchTerm],
    queryFn: async () => {
      if (!user_id) {
        throw new Error("user_id is required");
      }
      const result = await catalogService.getAllCategories(
        page,
        per_page,
        user_id,
        searchTerm,
        "name",
        "asc"
      );
      return {
        categories: result.categories,
        total: result.total,
      };
    },
    enabled: !!user_id,
    initialData: { categories: [], total: 0 },
  });
};

export const useGetBrands = (user_id: string | null) => {
  return useQuery({
    queryKey: ["product-brand", user_id],
    queryFn: async () => {
      if (!user_id) {
        throw new Error("user_id is required");
      }
      return await catalogService.getBrands(user_id);
    },
    enabled: !!user_id,
    staleTime: 60 * 60 * 24 * 1000, // 1 día en milisegundos
    gcTime: 60 * 60 * 24 * 1000, // 1 día en milisegundos
  });
};

export const useGetBrandsPaginated = (
  page: number,
  per_page: number,
  user_id: string | null,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ["brands-paginated", page, per_page, user_id, searchTerm],
    queryFn: async () => {
      if (!user_id) {
        throw new Error("user_id is required");
      }
      // Get all brands and do client-side pagination since backend doesn't support pagination for brands
      const allBrands = await catalogService.getBrands(user_id);
      
      // Filter by searchTerm if exists
      let filteredBrands = allBrands;
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredBrands = allBrands.filter((brand: BrandItem) =>
          brand.name.toLowerCase().includes(searchLower)
        );
      }

      // Client-side pagination
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + per_page;
      const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

      return {
        brands: paginatedBrands,
        total: filteredBrands.length,
      };
    },
    enabled: !!user_id,
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
    queryFn: async () => {
      return await productService.getAllBaseProducts(
        page,
        per_page,
        searchTerm || undefined,
        "name",
        "asc"
      );
    },
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
      if (!user_id) {
        throw new Error("user_id is required");
      }
      const result = await productService.getUserProducts(
        page,
        per_page,
        user_id,
        searchTerm || undefined,
        "name",
        "asc"
      );
      return result
    },
    enabled: !!user_id,
    initialData: { products: [], total: 0 },
  });
};

export const useCreateProductBase = () => {
  return useMutation({
    mutationFn: (data: ProductBaseForm) =>
      productService.createBaseProduct({
        name: data.name,
        brand_id: data.brand_id,
        categories: data.categories.map((cat) => Number(cat)).filter((cat) => !isNaN(cat)),
      }),
  });
};

export const useCreateProductVariant = () => {
  return useMutation({
    mutationFn: (data: ProductVariantForm) => {
      if (!data.capacity) {
        throw new Error("capacity is required");
      }
      return productService.createProductVariantWithUser({
        product_base_id: data.product_base_id,
        presentation: data.presentation,
        capacity: data.capacity,
        unit_id: Number(data.unit_id),
        units: data.units,
        barcode: data.barcode || "",
        price: data.price,
        stock_quantity: data.stock_quantity,
        min_stock: data.min_stock,
        user_id: data.user_id,
      });
    },
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
    }) => productService.createUserProductVariant(data),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductForm }) =>
      productService.updateBaseProduct(id, {
        name: data.name,
        brand_id: data.brand_id,
        categories: data.categories.map((cat) => Number(cat)).filter((cat) => !isNaN(cat)),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-base-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-base"] });
    },
  });
};

export const useUpdateUserProductPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      variant_id,
      user_id,
      price,
    }: {
      variant_id: number;
      user_id: string;
      price: number;
    }) => {
      // Get user products to find the user_product_variant_id
      const userProducts = await productService.getUserProducts(1, 1000, user_id);
      const userProduct = userProducts.products.find(
        (p: any) => p.variant_id === variant_id
      );
      if (!userProduct) {
        throw new Error("User product variant not found");
      }
      return productService.updateUserProductVariant(
        userProduct.user_product_variant_id,
        { price }
      );
    },
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
    }) =>
      productService.updateProductVariant(id, {
        presentation: data.presentation,
        capacity: data.capacity,
        unit_id: data.unit_id ? Number(data.unit_id) : undefined,
        units: data.units,
        barcode: data.barcode,
      }),
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
      productService.updateUserProductVariant(user_product_variant_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-base"] });
    },
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; user_id?: string }) =>
      catalogService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brand"] });
      queryClient.invalidateQueries({ queryKey: ["brands-paginated"] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      catalogService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brand"] });
      queryClient.invalidateQueries({ queryKey: ["brands-paginated"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      user_id?: string;
    }) => catalogService.createCategory(data),
    onSuccess: () => {
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
    }) => catalogService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
    },
  });
};

export const useGetBaseProductById = (id: number) => {
  return useQuery({
    queryKey: ["product-base", id],
    queryFn: () => productService.getUserProductVariantById(id),
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
        return await productService.checkUserProductVariantExists(
          variantId,
          userId
        );
      } catch {
        return false;
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
      productService.getAllBaseProducts(1, 20, searchTerm, "name", "asc"),
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
      if (!productId) {
        throw new Error("productId is required");
      }
      return await productService.getVariantsByProductId(productId);
    },
    enabled: enabled && productId !== null && productId > 0,
    staleTime: 60000, // 1 minuto
  });
};
