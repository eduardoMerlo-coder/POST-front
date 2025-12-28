import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para llamadas directas desde el frontend
 * 
 * Este cliente se usa para:
 * - Queries directas a tablas (productos, categorías, marcas, etc.)
 * - Llamadas a funciones RPC (create_base_product, etc.)
 * - Operaciones CRUD estándar
 * 
 * Para operaciones admin que requieren Service Role Key,
 * se deben usar Edge Functions (ver helper abajo)
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper para llamar a Edge Functions de Supabase
 * 
 * Úsalo para operaciones admin que requieren Service Role Key:
 * - create-user
 * - update-user-metadata
 * - list-users
 * - delete-user
 * 
 * @example
 * const result = await callEdgeFunction('create-user', { email, password, role_id });
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  body?: Record<string, any>
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No hay sesión activa");
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: body || {},
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw error;
  }

  return data as T;
}
