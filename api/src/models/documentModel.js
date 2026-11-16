import { supabase } from "../config/supabaseClient.js";
import { countWords } from "../utils/text.js";

const LIST_COLUMNS =
  "id, book_id, title, word_count, created_at, updated_at, books ( id, name )";

export const DocumentModel = {
  async getAll({ bookId, search } = {}) {
    let query = supabase
      .from("documents")
      .select(LIST_COLUMNS)
      .order("updated_at", { ascending: false });
    if (bookId) query = query.eq("book_id", bookId);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("documents")
      .select("*, books ( id, name ), snapshots(count)")
      .eq("id", id)
      .single();
    if (error) throw error;
    const { snapshots, ...doc } = data;
    return { ...doc, snapshot_count: snapshots?.[0]?.count ?? 0 };
  },

  async create({ book_id, title, content = "" }) {
    const { data, error } = await supabase
      .from("documents")
      .insert([{ book_id, title, content, word_count: countWords(content) }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const changes = { updated_at: new Date().toISOString() };
    if (payload.title !== undefined) changes.title = payload.title;
    if (payload.book_id !== undefined) changes.book_id = payload.book_id;
    if (payload.content !== undefined) {
      changes.content = payload.content;
      changes.word_count = countWords(payload.content);
    }
    const { data, error } = await supabase
      .from("documents")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;
    return { message: "Document deleted successfully" };
  },
};
