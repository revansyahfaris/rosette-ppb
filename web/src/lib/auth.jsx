import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";
import { session } from "./session.js";

const AuthContext = createContext(null);

// Menyimpan siapa yang sedang masuk dan menyediakan login / daftar / keluar
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.getToken() ? session.getUser() : null));
  // "manual" = menekan tombol Keluar, "expired" = token ditolak server.
  // Setelah keluar manual, login berikutnya mulai dari Pustaka, bukan halaman terakhir.
  const [logoutReason, setLogoutReason] = useState(null);

  const endSession = useCallback((reason) => {
    session.clear();
    setLogoutReason(reason);
    setUser(null);
  }, []);
  const logout = useCallback(() => endSession("manual"), [endSession]);

  // API membalas 401 (token kedaluwarsa) -> keluar otomatis
  useEffect(() => {
    const onUnauthorized = () => endSession("expired");
    window.addEventListener("rosette:unauthorized", onUnauthorized);
    return () => window.removeEventListener("rosette:unauthorized", onUnauthorized);
  }, [endSession]);

  // Saat aplikasi dibuka, perbarui data akun dari server. Kalau offline, sesi tetap dipakai.
  useEffect(() => {
    if (!session.getToken()) return;
    api.auth
      .me()
      .then((u) => {
        session.set(null, u);
        setUser(u);
      })
      .catch(() => {});
  }, []);

  const finish = ({ token, user: u }) => {
    session.set(token, u);
    setLogoutReason(null);
    setUser(u);
    return u;
  };

  const login = async (username, password) => finish(await api.auth.login({ username, password }));
  const register = async (name, username, password) =>
    finish(await api.auth.register({ name, username, password }));

  return (
    <AuthContext.Provider value={{ user, logoutReason, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
