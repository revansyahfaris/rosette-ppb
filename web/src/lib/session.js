// Sesi login yang tersimpan di perangkat: token JWT dari API + data pengguna
const TOKEN_KEY = "rosette:token";
const USER_KEY = "rosette:user";

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const session = {
  getToken: () => read(TOKEN_KEY),
  getUser() {
    try {
      return JSON.parse(read(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  set(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* penyimpanan tidak tersedia */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Draft lokal milik akun ini tidak boleh terbawa ke akun berikutnya
      Object.keys(localStorage)
        .filter((k) => k.startsWith("rosette:draft:"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* abaikan */
    }
    // Cache data API di service worker juga dibersihkan
    if ("caches" in window) caches.delete("rosette-api").catch(() => {});
  },
};
