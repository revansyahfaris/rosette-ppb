import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../lib/auth.jsx";

// Halaman Masuk dan Daftar (mode ditentukan dari prop)
export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const location = useLocation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Setelah berhasil, App otomatis mengarahkan ke halaman tujuan (lihat App.jsx)
      if (isRegister) await register(name.trim(), username.trim(), password);
      else await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__brand">
        <img src="/pwa-192x192.png" alt="" width={44} height={44} />
        <span>Rosette</span>
      </div>

      <h1>{isRegister ? "Buat akun" : "Masuk"}</h1>
      <p className="auth__lede">
        {isRegister
          ? "Satu akun untuk menyimpan buku, naskah, dan seluruh riwayat versimu."
          : "Lanjutkan menulis dari perangkat mana pun."}
      </p>

      <form className="form" onSubmit={submit} noValidate>
        {isRegister && (
          <label className="field">
            <span>Nama</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="mis. Faris Revansyah"
              maxLength={60}
              required
            />
          </label>
        )}
        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="mis. faris"
            maxLength={30}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="password">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? "Minimal 6 karakter" : ""}
              required
            />
            <button
              type="button"
              className="password__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn--block" disabled={busy || !username || !password || (isRegister && !name)}>
          {busy ? "Memproses…" : isRegister ? "Daftar" : "Masuk"}
        </button>
      </form>

      <p className="auth__switch">
        {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link to={isRegister ? "/masuk" : "/daftar"} state={location.state} replace>
          {isRegister ? "Masuk" : "Daftar sekarang"}
        </Link>
      </p>
    </div>
  );
}
