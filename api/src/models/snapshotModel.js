import { supabase } from "../config/supabaseClient.js";
import { DocumentModel } from "./documentModel.js";

// Daftar snapshot tidak mengirim kolom content (bisa besar) — content hanya di detail
// documents!inner supaya bisa difilter berdasarkan buku (documents.book_id)
const LIST_COLUMNS =
  "id, document_id, message, word_count, created_at, documents!inner ( id, title, book_id, books ( id, name, cover_color ) )";

export const SnapshotModel = {
  async getAll({ documentId, bookId } = {}) {
    let query = supabase
      .from("snapshots")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false });
    if (documentId) query = query.eq("document_id", documentId);
    if (bookId) query = query.eq("documents.book_id", bookId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("snapshots")
      .select("*, documents ( id, title, content, book_id )")
      .eq("id", id)
      .single();
    if (error) throw error;

    // Cari snapshot sebelumnya pada dokumen yang sama, untuk perbandingan (diff)
    const { data: prev, error: prevError } = await supabase
      .from("snapshots")
      .select("id, message, content, created_at")
      .eq("document_id", data.document_id)
      .lt("created_at", data.created_at)
      .order("created_at", { ascending: false })
      .limit(1);
    if (prevError) throw prevError;

    return { ...data, previous: prev?.[0] ?? null };
  },

  // "Commit": simpan isi dokumen saat ini sebagai snapshot baru
  async create({ document_id, message }) {
    const doc = await DocumentModel.getById(document_id);
    const { data, error } = await supabase
      .from("snapshots")
      .insert([
        {
          document_id,
          message,
          content: doc.content ?? "",
          word_count: doc.word_count ?? 0,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Kembalikan dokumen ke isi snapshot. Isi saat ini diamankan dulu sebagai
  // snapshot otomatis, supaya restore tidak pernah menghapus tulisan.
  async restore(id) {
    const snap = await this.getById(id);
    const backup = await this.create({
      document_id: snap.document_id,
      message: `Otomatis: sebelum restore ke "${snap.message}"`,
    });
    const document = await DocumentModel.update(snap.document_id, {
      content: snap.content,
    });
    return { document, backup_snapshot_id: backup.id };
  },

  async remove(id) {
    const { error } = await supabase.from("snapshots").delete().eq("id", id);
    if (error) throw error;
    return { message: "Snapshot deleted successfully" };
  },
};
