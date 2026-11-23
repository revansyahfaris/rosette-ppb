import { supabase } from "../config/supabaseClient.js";

const PUBLIC_COLUMNS = "id, name, username, created_at";

export const UserModel = {
  // Termasuk password_hash: hanya dipakai di controller login, tidak pernah dikirim ke klien
  async findByUsername(username) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("users")
      .select(PUBLIC_COLUMNS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create({ name, username, password_hash }) {
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, username, password_hash }])
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  async count() {
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  },

  // Data yang dibuat sebelum ada fitur login (user_id kosong) diberikan
  // ke akun pertama yang mendaftar, supaya tidak ada data yang hilang.
  async claimOrphans(userId) {
    for (const table of ["books", "documents", "snapshots"]) {
      const { error } = await supabase
        .from(table)
        .update({ user_id: userId })
        .is("user_id", null);
      if (error) throw error;
    }
  },
};
