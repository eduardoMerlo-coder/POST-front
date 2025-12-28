import { supabase } from "@/lib/supabaseClient";

export class UomService {
  async getAllUoms() {
    const { data: uoms, error } = await supabase
      .from("unit_of_measure")
      .select("*");

    if (error) throw error;
    return uoms;
  }

  async getUom(id: number) {
    const { data: uom, error } = await supabase
      .from("unit_of_measure")
      .select("*")
      .eq("id", id);

    if (error) throw error;
    return uom;
  }

  async createUom(data: { name: string; description?: string }) {
    const { data: newUom, error } = await supabase
      .from("unit_of_measure")
      .insert(data)
      .select();

    if (error) throw error;
    return newUom;
  }

  async updateUom(id: number, data: { name?: string; description?: string }) {
    const { data: updatedUom, error } = await supabase
      .from("unit_of_measure")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return updatedUom;
  }

  async deleteUom(id: number) {
    const { data: deletedUom, error } = await supabase
      .from("unit_of_measure")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    return deletedUom;
  }
}

export const uomService = new UomService();

