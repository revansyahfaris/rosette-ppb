// Hitung jumlah kata dari isi dokumen (HTML dari editor TipTap)
export function countWords(html = "") {
  const text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

// Supabase mengembalikan kode PGRST116 jika .single() tidak menemukan baris
export function statusFromError(err, fallback = 400) {
  if (err?.code === "PGRST116") return 404;
  if (err?.status) return err.status;
  return fallback;
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
