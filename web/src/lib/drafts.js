// Draft lokal (offline-first): setiap ketikan disimpan di perangkat dulu,
// lalu disinkronkan ke API. Kalau sinkronisasi gagal (offline), draft tetap aman.
const KEY = (id) => `rosette:draft:${id}`;

export const drafts = {
  save(id, content) {
    try {
      localStorage.setItem(KEY(id), JSON.stringify({ content, savedAt: Date.now() }));
    } catch {
      /* penyimpanan penuh / mode privat: abaikan */
    }
  },
  load(id) {
    try {
      const raw = localStorage.getItem(KEY(id));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear(id) {
    try {
      localStorage.removeItem(KEY(id));
    } catch {
      /* abaikan */
    }
  },
};
