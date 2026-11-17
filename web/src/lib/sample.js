import { api } from "./api.js";

// Membuat satu buku contoh lengkap dengan riwayat versi, lewat API yang sama
// dengan yang dipakai pengguna. Mengembalikan id buku.
const V1 = `<h2>Surat untuk Diriku Lima Tahun Lagi</h2>
<p>Hai. Saat surat ini ditulis, aku masih kuliah dan sering begadang mengerjakan tugas.</p>
<p>Semoga kamu masih ingat kenapa dulu memilih jalan ini.</p>`;

const V2 = `<h2>Surat untuk Diriku Lima Tahun Lagi</h2>
<p>Hai. Saat surat ini ditulis, aku masih kuliah dan terlalu sering begadang demi tugas yang selalu selesai di menit terakhir.</p>
<p>Semoga kamu masih ingat kenapa dulu memilih jalan ini, dan semoga jawabannya masih sama.</p>
<blockquote>Tulis dulu, rapikan nanti.</blockquote>`;

const V3 = `${V2}
<p>Kalau belum sempat jadi apa-apa, tidak apa-apa. Yang penting kamu masih menulis.</p>`;

export async function createSampleBook() {
  const book = await api.books.create({
    name: "Contoh: Surat untuk Masa Depan",
    description: "Buku contoh dari panduan Rosette. Boleh dihapus kapan saja.",
    cover_color: "#2f5d7c",
  });

  const doc = await api.documents.create({
    book_id: book.id,
    title: "Surat pertama",
    content: V1,
  });
  await api.snapshots.create({ document_id: doc.id, message: "Draft pertama" });

  await api.documents.update(doc.id, { content: V2 });
  await api.snapshots.create({ document_id: doc.id, message: "Perjelas paragraf pembuka" });

  // Isi terbaru sengaja belum disimpan sebagai versi, supaya tab "vs Sekarang" ada isinya
  await api.documents.update(doc.id, { content: V3 });

  await api.documents.create({
    book_id: book.id,
    title: "Catatan ide",
    content: "<p>Daftar hal yang ingin kutulis berikutnya.</p>",
  });

  return book.id;
}
