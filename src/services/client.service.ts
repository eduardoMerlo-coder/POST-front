import { supabase } from "@/lib/supabaseClient";

export class ClientService {
  /**
   * Search clients by name or document number
   */
  async searchClients(searchTerm: string, user_id: string) {
    if (!searchTerm.trim()) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase().trim();

    // Buscar en múltiples campos usando or() con ilike
    const { data, error } = await supabase
      .from("client")
      .select("*")
      .eq("user_id", user_id)
      .or(
        `name.ilike.%${searchLower}%,last_name.ilike.%${searchLower}%,document_number.ilike.%${searchLower}%`
      )
      .limit(20);

    if (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
    return data || [];
  }

  /**
   * Create a new client
   */
  async createClient(data: {
    name: string;
    last_name?: string;
    phone?: string;
    email?: string;
    document_number?: string;
    user_id: string;
  }) {
    const { data: newClient, error } = await supabase
      .from("client")
      .insert({
        name: data.name,
        last_name: data.last_name || null,
        phone: data.phone || null,
        email: data.email || null,
        document_number: data.document_number || null,
        user_id: data.user_id,
      })
      .select("*")
      .single();

    if (error) throw error;
    return newClient;
  }

  /**
   * Get or create the generic client for a user
   * This ensures there's always a generic client available
   */
  async getOrCreateGenericClient(user_id: string) {
    const GENERIC_CLIENT_NAME = "CLIENTE GENERICO";

    // Buscar si ya existe
    const { data: existingClient, error: searchError } = await supabase
      .from("client")
      .select("*")
      .eq("user_id", user_id)
      .eq("name", GENERIC_CLIENT_NAME)
      .maybeSingle();

    if (searchError) {
      console.error("Error searching generic client:", searchError);
      throw searchError;
    }

    // Si existe, retornarlo
    if (existingClient) {
      return existingClient;
    }

    // Si no existe, crearlo
    const { data: newClient, error: createError } = await supabase
      .from("client")
      .insert({
        name: GENERIC_CLIENT_NAME,
        last_name: null,
        phone: null,
        email: null,
        document_number: null,
        user_id: user_id,
      })
      .select("*")
      .single();

    if (createError) {
      console.error("Error creating generic client:", createError);
      throw createError;
    }

    return newClient;
  }
}

export const clientService = new ClientService();

