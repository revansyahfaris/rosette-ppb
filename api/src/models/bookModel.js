import { supabase } from "../config/supabaseClient.js";

// Semua fungsi menerima userId: pengguna hanya bisa melihat dan mengubah bukunya sendiri
export const BookModel = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from("books")
      .select("*, documents(count)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    // Ratakan hasil count: documents: [{count: 3}] -> document_count: 3
    return data.map(({ documents, ...book }) => ({
      ...book,
      document_count: documents?.[0]?.count ?? 0,
    }));
  },

  async getById(userId, id) {
    const { data, error } = await supabase
      .from("books")
      .select(
        `*, documents ( id, title, word_count, created_at, updated_at )`
      )
      .eq("id", id)
      .eq("user_id", userId)
      .order("updated_at", { referencedTable: "documents", ascending: false })
      .single();
    if (error) throw error;
    return data;
  },

  async create(userId, payload) {
    const { data, error } = await supabase
      .from("books")
      .insert([{ ...payload, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId, id, payload) {
    const { data, error } = await supabase
      .from("books")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Bump updated_at tanpa ubah data lain, dipanggil saat dokumen anaknya berubah
  // supaya urutan "rak buku" (sort by updated_at) ikut naik
  async touch(userId, id) {
    const { error } = await supabase
      .from("books")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async remove(userId, id) {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { message: "Book deleted successfully" };
  },
};
