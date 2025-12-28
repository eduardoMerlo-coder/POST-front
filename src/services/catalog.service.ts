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

export class CatalogService {
  /**
   * Get all categories with pagination, search, and filtering
   */
  async getAllCategories(
    page: number,
    per_page: number,
    user_id?: string,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    let query = supabase.from("category").select("*", { count: "exact" });

    // Filter by user or business_type_id if user_id is provided
    if (user_id) {
      // Get business_type_id from user profile
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("business_type_id")
        .eq("id", user_id)
        .single();

      if (profileError) throw profileError;

      // Build filter: user_id = user_id OR business_type_id = user's business_type_id
      if (profile?.business_type_id) {
        query = query.or(
          `user_id.eq.${user_id},business_type_id.eq.${profile.business_type_id}`
        );
      } else {
        // If user doesn't have business_type_id, only filter by user_id
        query = query.eq("user_id", user_id);
      }
    } else {
      // If no user_id, only return global categories (no owner)
      query = query.is("user_id", null).is("business_type_id", null);
    }

    // Apply search if search_term exists
    if (search_term) {
      const escapedTerm = escapeSearchTerm(search_term);
      query = query.or(
        `name.ilike.%${escapedTerm}%,description.ilike.%${escapedTerm}%`
      );
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

    return {
      categories: data || [],
      total: count || 0,
    };
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number) {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create category
   */
  async createCategory(data: {
    name: string;
    description?: string;
    user_id?: string;
  }) {
    // Prepare insert data
    const insertData: {
      name: string;
      description?: string | null;
      user_id?: string;
      business_type_id?: number | null;
    } = {
      name: data.name,
      description: data.description || null,
    };

    // If user_id is provided, determine whether to assign user_id or business_type_id
    if (data.user_id) {
      // Get business_type_id from user profile
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("business_type_id")
        .eq("id", data.user_id)
        .single();

      if (profileError) throw profileError;

      // If user has business_type_id, assign it; otherwise, assign user_id
      if (profile?.business_type_id) {
        insertData.business_type_id = profile.business_type_id;
      } else {
        insertData.user_id = data.user_id;
      }
    }

    const { data: newCategory, error } = await supabase
      .from("category")
      .insert(insertData)
      .select("*")
      .single();

    if (error) throw error;
    return newCategory;
  }

  /**
   * Update category
   */
  async updateCategory(id: number, data: { name?: string; description?: string }) {
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from("category")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingCategory) {
      throw new Error(`Categoría con id ${id} no encontrada`);
    }

    // Prepare update data
    const updateData: {
      name?: string;
      description?: string | null;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    // Update category if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("category")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Get updated category
    const { data: updatedCategory, error: fetchError } = await supabase
      .from("category")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    return updatedCategory;
  }

  /**
   * Get all brands
   */
  async getBrands(user_id?: string) {
    let query = supabase.from("brand").select("*");

    // Filter by user or business_type_id if user_id is provided
    if (user_id) {
      // Get business_type_id from user profile
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("business_type_id")
        .eq("id", user_id)
        .single();

      if (profileError) throw profileError;

      // Build filter: user_id = user_id OR business_type_id = user's business_type_id
      if (profile?.business_type_id) {
        query = query.or(
          `user_id.eq.${user_id},business_type_id.eq.${profile.business_type_id}`
        );
      } else {
        // If user doesn't have business_type_id, only filter by user_id
        query = query.eq("user_id", user_id);
      }
    } else {
      // If no user_id, only return global brands (no owner)
      query = query.is("user_id", null).is("business_type_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: number) {
    const { data, error } = await supabase
      .from("brand")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create brand
   */
  async createBrand(data: { name: string; user_id?: string }) {
    // Prepare insert data
    const insertData: {
      name: string;
      user_id?: string;
      business_type_id?: number | null;
    } = {
      name: data.name.toLowerCase(),
    };

    // If user_id is provided, determine whether to assign user_id or business_type_id
    if (data.user_id) {
      // Get business_type_id from user profile
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("business_type_id")
        .eq("id", data.user_id)
        .single();

      if (profileError) throw profileError;

      // If user has business_type_id, assign it; otherwise, assign user_id
      if (profile?.business_type_id) {
        insertData.business_type_id = profile.business_type_id;
      } else {
        insertData.user_id = data.user_id;
      }
    }

    const { data: newBrand, error } = await supabase
      .from("brand")
      .insert(insertData)
      .select("*")
      .single();

    if (error) throw error;
    return newBrand;
  }

  /**
   * Update brand
   */
  async updateBrand(id: number, data: { name: string }) {
    // Check if brand exists
    const { data: existingBrand, error: checkError } = await supabase
      .from("brand")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingBrand) {
      throw new Error(`Marca con id ${id} no encontrada`);
    }

    // Prepare update data
    const updateData: {
      name?: string;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name.toLowerCase();
    }

    // Update brand if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("brand")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Get updated brand
    const { data: updatedBrand, error: fetchError } = await supabase
      .from("brand")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    return updatedBrand;
  }
}

export const catalogService = new CatalogService();

