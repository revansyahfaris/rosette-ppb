import { supabase } from "../config/supabaseClient.js";

export const BookModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("books")
      .select("*, documents(count)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    // Ratakan hasil count: documents: [{count: 3}] -> document_count: 3
    return data.map(({ documents, ...book }) => ({
      ...book,
      document_count: documents?.[0]?.count ?? 0,
    }));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("books")
      .select(
        `*, documents ( id, title, word_count, created_at, updated_at )`
      )
      .eq("id", id)
      .order("updated_at", { referencedTable: "documents", ascending: false })
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("books")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("books")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Bump updated_at tanpa ubah data lain, dipanggil saat dokumen anaknya berubah
  // supaya urutan "rak buku" (sort by updated_at) ikut naik
  async touch(id) {
    const { error } = await supabase
      .from("books")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id) {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw error;
    return { message: "Book deleted successfully" };
  },
};
