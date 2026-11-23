// Client untuk Rosette API (folder api/). Semua halaman memanggil fungsi di sini.
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  // Kalau yang datang bukan JSON (mis. VITE_API_URL salah dan yang terpanggil
  // halaman web), tampilkan error yang jelas daripada layar kosong.
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (!isJson) {
    throw new Error(`API tidak membalas JSON dari ${BASE_URL}. Cek VITE_API_URL lalu redeploy.`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request gagal (${res.status})`);
  return data;
}

const qs = (params) => {
  const s = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return s ? `?${s}` : "";
};

export const api = {
  books: {
    list: () => request("/api/books"),
    get: (id) => request(`/api/books/${id}`),
    create: (body) => request("/api/books", { method: "POST", body }),
    update: (id, body) => request(`/api/books/${id}`, { method: "PUT", body }),
    remove: (id) => request(`/api/books/${id}`, { method: "DELETE" }),
  },
  documents: {
    list: ({ bookId, search } = {}) =>
      request(`/api/documents${qs({ book_id: bookId, search })}`),
    get: (id) => request(`/api/documents/${id}`),
    create: (body) => request("/api/documents", { method: "POST", body }),
    update: (id, body) => request(`/api/documents/${id}`, { method: "PUT", body }),
    remove: (id) => request(`/api/documents/${id}`, { method: "DELETE" }),
  },
  snapshots: {
    list: ({ documentId, bookId } = {}) =>
      request(`/api/snapshots${qs({ document_id: documentId, book_id: bookId })}`),
    get: (id) => request(`/api/snapshots/${id}`),
    create: (body) => request("/api/snapshots", { method: "POST", body }),
    restore: (id) => request(`/api/snapshots/${id}/restore`, { method: "POST" }),
    remove: (id) => request(`/api/snapshots/${id}`, { method: "DELETE" }),
  },
};
