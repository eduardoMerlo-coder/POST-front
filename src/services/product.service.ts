import { supabase } from "@/lib/supabaseClient";

/**
 * Escapes special characters in search terms for safe use in PostgREST filter strings.
 */
function escapeSearchTerm(term: string): string {
  return term
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export class ProductService {
  /**
   * Get all base products with pagination, search, and sorting
   */
  async getAllBaseProducts(
    page: number,
    per_page: number,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    let query = supabase.from("product").select(
      `
          *,
          brand:brand_id(id, name),
          product_category(
            category:category_id(id, name, description)
          ),
          product_business_type(business_type_id)
        `,
      { count: "exact" }
    );

    // Apply search if search_term exists
    if (search_term) {
      const escapedTerm = escapeSearchTerm(search_term);

      // First search for matching brands
      const { data: matchingBrands } = await supabase
        .from("brand")
        .select("id")
        .ilike("name", `%${escapedTerm}%`);

      const brandIds = matchingBrands?.map((b) => b.id) || [];

      // If there are matching brands, make two queries and combine results
      if (brandIds.length > 0) {
        // Query 1: products where name matches
        const query1 = supabase
          .from("product")
          .select(
            `
              *,
              brand:brand_id(id, name),
              product_category(
                category:category_id(id, name, description)
              ),
              product_business_type(business_type_id)
            `,
            { count: "exact" }
          )
          .ilike("name", `%${escapedTerm}%`);

        // Query 2: products where brand_id is in matching brands
        const query2 = supabase
          .from("product")
          .select(
            `
              *,
              brand:brand_id(id, name),
              product_category(
                category:category_id(id, name, description)
              ),
              product_business_type(business_type_id)
            `
          )
          .in("brand_id", brandIds);

        // Execute both queries
        const [result1, result2] = await Promise.all([query1, query2]);

        if (result1.error) throw result1.error;
        if (result2.error) throw result2.error;

        // Combine results and remove duplicates
        const combinedData = [...(result1.data || []), ...(result2.data || [])];
        const uniqueProducts = Array.from(
          new Map(combinedData.map((p) => [p.id, p])).values()
        );

        // Apply sorting
        const orderDirection = order.toLowerCase() === "desc" ? "desc" : "asc";
        uniqueProducts.sort((a, b) => {
          let aVal: any;
          let bVal: any;

          if (sort === "name") {
            aVal = a.name || "";
            bVal = b.name || "";
          } else if (sort === "brand_id") {
            aVal = a.brand_id ?? 0;
            bVal = b.brand_id ?? 0;
          } else {
            const valA = a[sort];
            const valB = b[sort];
            const isNumeric =
              (typeof valA === "number" && !isNaN(valA)) ||
              (typeof valB === "number" && !isNaN(valB));

            if (isNumeric) {
              aVal =
                typeof valA === "number"
                  ? valA
                  : valA !== null
                  ? Number(valA)
                  : 0;
              bVal =
                typeof valB === "number"
                  ? valB
                  : valB !== null
                  ? Number(valB)
                  : 0;
              aVal = isNaN(aVal) ? 0 : aVal;
              bVal = isNaN(bVal) ? 0 : bVal;
            } else {
              aVal = valA !== null ? String(valA) : "";
              bVal = valB !== null ? String(valB) : "";
            }
          }

          if (orderDirection === "asc") {
            if (typeof aVal === "string") {
              return aVal.localeCompare(bVal);
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          } else {
            if (typeof aVal === "string") {
              return bVal.localeCompare(aVal);
            }
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
          }
        });

        // Apply pagination
        const paginatedData = uniqueProducts.slice(
          (page - 1) * per_page,
          page * per_page
        );

        // Transform data
        const transformedProducts = paginatedData.map((product: any) => {
          const categories =
            product.product_category?.map((pc: any) => pc.category) || [];
          const business_types =
            product.product_business_type?.map(
              (pbt: any) => pbt.business_type_id
            ) || [];

          return {
            id: product.id,
            name: product.name,
            brand_id: product.brand_id,
            brand: product.brand,
            categories: categories,
            business_types: business_types,
          };
        });

        return {
          products: transformedProducts,
          total: uniqueProducts.length,
        };
      } else {
        // If no matching brands, only search in name
        query = query.ilike("name", `%${escapedTerm}%`);
      }
    }

    // Apply sorting
    const orderDirection = order.toLowerCase() === "desc" ? "desc" : "asc";
    query = query.order(sort, { ascending: orderDirection === "asc" });

    // Apply pagination
    const { data, error, count } = await query.range(
      (page - 1) * per_page,
      page * per_page - 1
    );

    if (error) throw error;

    // Transform data
    const transformedProducts = data?.map((product: any) => {
      const categories =
        product.product_category?.map((pc: any) => pc.category) || [];
      const business_types =
        product.product_business_type?.map(
          (pbt: any) => pbt.business_type_id
        ) || [];

      return {
        id: product.id,
        name: product.name,
        brand_id: product.brand_id,
        brand: product.brand,
        categories: categories,
        business_types: business_types,
      };
    });

    return { products: transformedProducts, total: count };
  }

  /**
   * Get user products with pagination, search, and sorting
   */
  async getUserProducts(
    page: number,
    per_page: number,
    user_id: string,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    // Get all user_product_variant for the user with relations
    const { data, error } = await supabase
      .from("user_product_variant")
      .select(
        `
          *,
          variant:variant_id(
            id,
            name,
            status,
            barcode,
            capacity,
            units,
            uom:uom_id(
              id,
              name,
              description
            ),
            product:product_id(
              id,
              name,
              brand:brand_id(
                id,
                name
              )
            )
          )
        `,
        { count: "exact" }
      )
      .eq("user_id", user_id);

    if (error) throw error;

    // Transform data
    let transformedProducts =
      data?.map((upv: any) => {
        const variant = upv.variant;
        const product = variant?.product;
        return {
          id: variant?.id || 0,
          variant_id: upv.variant_id || 0,
          product_id: product?.id || 0,
          user_product_variant_id: upv.id || 0,
          name: product?.name || "",
          variant_name: variant?.name || "",
          price: String(upv.price || 0),
          capacity: variant?.capacity || 0,
          unit: variant?.uom?.name || "",
          brand: product?.brand?.name || "",
          barcode: variant?.barcode || "",
          status: variant?.status || "ACTIVE",
          stock_quantity: upv.stock_quantity || 0,
        };
      }) || [];

    // Apply search if search_term exists
    if (search_term) {
      const searchLower = search_term.toLowerCase();
      transformedProducts = transformedProducts.filter((product: any) => {
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sorting
    const orderDirection = order.toLowerCase() === "desc" ? "desc" : "asc";
    transformedProducts.sort((a: any, b: any) => {
      // Prioritize products with price 0
      const aPriceIsZero = parseFloat(a.price) === 0;
      const bPriceIsZero = parseFloat(b.price) === 0;

      if (aPriceIsZero && !bPriceIsZero) return -1;
      if (!aPriceIsZero && bPriceIsZero) return 1;

      let aVal: any;
      let bVal: any;

      if (sort === "name") {
        aVal = a.name || "";
        bVal = b.name || "";
      } else if (sort === "price") {
        aVal = parseFloat(a.price) || 0;
        bVal = parseFloat(b.price) || 0;
      } else {
        const valA = a[sort];
        const valB = b[sort];
        const isNumeric =
          (typeof valA === "number" && !isNaN(valA)) ||
          (typeof valB === "number" && !isNaN(valB));

        if (isNumeric) {
          aVal = typeof valA === "number" ? valA : valA ? Number(valA) : 0;
          bVal = typeof valB === "number" ? valB : valB ? Number(valB) : 0;
          aVal = isNaN(aVal) ? 0 : aVal;
          bVal = isNaN(bVal) ? 0 : bVal;
        } else {
          aVal = valA !== null ? String(valA) : "";
          bVal = valB !== null ? String(valB) : "";
        }
      }

      if (orderDirection === "asc") {
        if (typeof aVal === "string") {
          return aVal.localeCompare(bVal);
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        if (typeof aVal === "string") {
          return bVal.localeCompare(aVal);
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Save total before pagination
    const total = transformedProducts.length;

    // Apply pagination
    const paginatedProducts = transformedProducts.slice(
      (page - 1) * per_page,
      page * per_page
    );

    return {
      products: paginatedProducts,
      total: total,
    };
  }

  /**
   * Get base product by ID
   */
  async getBaseProductById(id: number) {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
          *,
          brand:brand_id(id, name),
          product_category(
            category:category_id(id, name, description)
          ),
          product_business_type(business_type_id)
        `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // Transform data
    const categories =
      data.product_category?.map((pc: any) => pc.category) || [];
    const business_types =
      data.product_business_type?.map((pbt: any) => pbt.business_type_id) || [];

    return {
      id: data.id,
      name: data.name,
      brand_id: data.brand_id,
      brand: data.brand,
      categories: categories,
      business_types: business_types,
    };
  }

  /**
   * Get variants by product ID
   */
  async getVariantsByProductId(productId: number) {
    const { data, error } = await supabase
      .from("product_variant")
      .select(
        `
        *,
        uom:uom_id(id, name, description)
      `
      )
      .eq("product_id", productId);

    if (error) throw error;

    // Transform data
    const transformedVariants = data?.map((variant: any) => ({
      id: variant.id,
      product_id: variant.product_id,
      name: variant.name,
      status: variant.status,
      barcode: variant.barcode,
      units: variant.units,
      capacity: variant.capacity,
      uom_id: variant.uom_id,
      uom: variant.uom,
    }));

    return transformedVariants || [];
  }

  /**
   * Create base product using RPC function
   */
  async createBaseProduct(data: {
    name: string;
    brand_id: number;
    categories?: number[];
  }) {
    const { data: result, error } = await supabase.rpc("create_base_product", {
      p_name: data.name,
      p_brand_id: data.brand_id,
      p_category_ids: data.categories || [],
    });

    if (error) {
      // Formatear el error de Supabase para que sea más legible
      const errorMessage = error.message || error.details || "Error al crear producto base";
      throw new Error(errorMessage);
    }
    
    if (!result) {
      throw new Error("No se recibió respuesta del servidor");
    }
    
    return result;
  }

  /**
   * Update base product
   */
  async updateBaseProduct(
    id: number,
    data: {
      name?: string;
      brand_id?: number;
      categories?: number[];
    }
  ) {
    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("product")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingProduct) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    // Prepare update data
    const updateData: {
      name?: string;
      brand_id?: number;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.brand_id !== undefined) {
      updateData.brand_id = data.brand_id;
    }

    // Update product if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("product")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // If there are categories, update relations atomically
    if (data.categories !== undefined) {
      const { error: categoryUpdateError } = await supabase.rpc(
        "update_product_categories",
        {
          p_product_id: id,
          p_category_ids: data.categories,
        }
      );

      if (categoryUpdateError) throw categoryUpdateError;
    }

    // Get updated product with relations
    const { data: productWithRelations, error: fetchError } = await supabase
      .from("product")
      .select(
        `
          *,
          brand:brand_id(id, name),
          product_category(
            category:category_id(id, name, description)
          )
        `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Transform data
    const categories =
      productWithRelations.product_category?.map((pc: any) => pc.category) ||
      [];

    return {
      id: productWithRelations.id,
      name: productWithRelations.name,
      brand_id: productWithRelations.brand_id,
      brand: productWithRelations.brand,
      categories: categories,
    };
  }

  /**
   * Create product variant with user using RPC function
   */
  async createProductVariantWithUser(data: {
    product_base_id: number;
    presentation: string;
    capacity: number;
    unit_id: number;
    units: number;
    barcode: string;
    price: number;
    stock_quantity: number;
    min_stock: number;
    user_id: string;
  }) {
    const { data: result, error } = await supabase.rpc(
      "create_product_variant_with_user",
      {
        p_product_base_id: data.product_base_id,
        p_presentation: data.presentation,
        p_capacity: data.capacity,
        p_unit_id: data.unit_id,
        p_quantity_per_package: data.units,
        p_price: data.price,
        p_stock_quantity: data.stock_quantity,
        p_min_stock: data.min_stock,
        p_user_id: data.user_id,
        p_barcode: data.barcode,
      }
    );

    if (error) throw error;
    return result;
  }

  /**
   * Create user product variant
   */
  async createUserProductVariant(data: {
    variant_id: number;
    price: number;
    stock_quantity: number;
    min_stock: number;
    user_id: string;
  }) {
    const { data: userProductVariant, error } = await supabase
      .from("user_product_variant")
      .insert({
        user_id: data.user_id,
        variant_id: data.variant_id,
        price: data.price,
        stock_quantity: data.stock_quantity,
        min_stock: data.min_stock,
      })
      .select("*")
      .single();

    if (error) throw error;
    return userProductVariant;
  }

  /**
   * Update user product variant
   */
  async updateUserProductVariant(
    userProductVariantId: number,
    data: {
      price?: number;
      stock_quantity?: number;
      min_stock?: number;
    }
  ) {
    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from("user_product_variant")
      .select("id")
      .eq("id", userProductVariantId)
      .single();

    if (checkError || !existing) {
      throw new Error(
        `User product variant con id ${userProductVariantId} no encontrado`
      );
    }

    // Prepare update data
    const updateData: {
      price?: number;
      stock_quantity?: number;
      min_stock?: number;
    } = {};

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.stock_quantity !== undefined) {
      updateData.stock_quantity = data.stock_quantity;
    }

    if (data.min_stock !== undefined) {
      updateData.min_stock = data.min_stock;
    }

    // Update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("user_product_variant")
        .update(updateData)
        .eq("id", userProductVariantId);

      if (updateError) throw updateError;
    }

    // Get updated variant
    const { data: updated, error: fetchError } = await supabase
      .from("user_product_variant")
      .select("*")
      .eq("id", userProductVariantId)
      .single();

    if (fetchError) throw fetchError;
    return updated;
  }

  /**
   * Update product variant
   */
  async updateProductVariant(
    id: number,
    data: {
      presentation?: string;
      capacity?: number;
      unit_id?: number;
      units?: number;
      barcode?: string;
    }
  ) {
    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from("product_variant")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      throw new Error(`Product variant con id ${id} no encontrado`);
    }

    // Prepare update data
    const updateData: {
      name?: string;
      capacity?: number;
      uom_id?: number;
      units?: number;
      barcode?: string;
    } = {};

    if (data.presentation !== undefined) {
      updateData.name = data.presentation;
    }

    if (data.capacity !== undefined) {
      updateData.capacity = data.capacity;
    }

    if (data.unit_id !== undefined) {
      updateData.uom_id = data.unit_id;
    }

    if (data.units !== undefined) {
      updateData.units = data.units;
    }

    if (data.barcode !== undefined) {
      updateData.barcode = data.barcode;
    }

    // Update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("product_variant")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Get updated variant with relations
    const { data: updated, error: fetchError } = await supabase
      .from("product_variant")
      .select(
        `
        *,
        uom:uom_id(id, name, description)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    return {
      id: updated.id,
      product_id: updated.product_id,
      name: updated.name,
      status: updated.status,
      barcode: updated.barcode,
      units: updated.units,
      capacity: updated.capacity,
      uom_id: updated.uom_id,
      uom: updated.uom,
    };
  }

  /**
   * Get user product variant by ID
   */
  async getUserProductVariantById(userProductVariantId: number) {
    const { data, error } = await supabase
      .from("user_product_variant")
      .select(
        `
          *,
          variant:variant_id(
            id,
            name,
            status,
            barcode,
            capacity,
            units,
            product_id,
            uom_id,
            product:product_id(
              id,
              name,
              brand_id,
              product_category(
                category:category_id(
                  id,
                  name
                )
              ),
              product_business_type(
                business_type_id
              )
            )
          )
        `
      )
      .eq("id", userProductVariantId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("No se encontró el producto variant del usuario");
    }

    const upv = data;
    const variant = upv.variant;
    const product = variant?.product;

    // Extract categories
    const categories =
      product?.product_category
        ?.map((pc: any) => pc.category?.id)
        .filter((id: any) => id !== undefined && id !== null && id !== "") ||
      [];

    // Extract business_types
    const business_types =
      product?.product_business_type?.map((pbt: any) => pbt.business_type_id) ||
      [];

    // Transform to expected format
    return {
      user_product_variant_id: upv.id || 0,
      name: product?.name || "",
      variant_id: variant?.id || undefined,
      product_id: product?.id || 0,
      barcode: variant?.barcode || "",
      brand_id: product?.brand_id || 0,
      capacity: variant?.capacity || 0,
      unit_id: String(variant?.uom_id || ""),
      categories: categories,
      business_types: business_types,
      units: variant?.units || 0,
      stock_quantity: upv.stock_quantity || 0,
      min_stock: upv.min_stock || 0,
      status: variant?.status || "ACTIVE",
      price: Number(upv.price) || 0,
      presentation: variant?.name || undefined,
    };
  }

  /**
   * Check if user product variant exists
   */
  async checkUserProductVariantExists(
    variantId: number,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_product_variant")
      .select("id")
      .eq("variant_id", variantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
}

export const productService = new ProductService();

