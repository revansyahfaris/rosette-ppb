import { supabase } from "../config/supabaseClient.js";
import { countWords } from "../utils/text.js";
import { BookModel } from "./bookModel.js";

const LIST_COLUMNS =
  "id, book_id, title, word_count, created_at, updated_at, books ( id, name )";

// Semua fungsi menerima userId: pengguna hanya bisa mengakses naskahnya sendiri
export const DocumentModel = {
  async getAll(userId, { bookId, search } = {}) {
    let query = supabase
      .from("documents")
      .select(LIST_COLUMNS)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (bookId) query = query.eq("book_id", bookId);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(userId, id) {
    const { data, error } = await supabase
      .from("documents")
      .select("*, books ( id, name ), snapshots(count)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    const { snapshots, ...doc } = data;
    return { ...doc, snapshot_count: snapshots?.[0]?.count ?? 0 };
  },

  async create(userId, { book_id, title, content = "" }) {
    // Pastikan buku tujuan milik pengguna ini (melempar 404 kalau bukan)
    await BookModel.getById(userId, book_id);
    const { data, error } = await supabase
      .from("documents")
      .insert([
        { user_id: userId, book_id, title, content, word_count: countWords(content) },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId, id, payload) {
    const changes = { updated_at: new Date().toISOString() };
    if (payload.title !== undefined) changes.title = payload.title;
    if (payload.book_id !== undefined) {
      await BookModel.getById(userId, payload.book_id);
      changes.book_id = payload.book_id;
    }
    if (payload.content !== undefined) {
      changes.content = payload.content;
      changes.word_count = countWords(payload.content);
    }
    const { data, error } = await supabase
      .from("documents")
      .update(changes)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId, id) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { message: "Document deleted successfully" };
  },
};
