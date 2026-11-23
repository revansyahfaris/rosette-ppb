import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenText, LogOut } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { useAuth } from "../lib/auth.jsx";
import { formatShort } from "../lib/useFetch.js";

// Halaman Profile/About (isi disusun seperti halaman kolofon di akhir buku)
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [confirmOut, setConfirmOut] = useState(false);

  return (
    <>
      <PageHeader title="Profil" subtitle="Akun dan tentang Rosette" />

      <section className="account">
        <span className="account__avatar" aria-hidden="true">
          {(user?.name || user?.username || "?").trim().charAt(0).toUpperCase()}
        </span>
        <div className="account__info">
          <strong>{user?.name}</strong>
          <span>
            @{user?.username}
            {user?.created_at && <> · bergabung {formatShort(user.created_at)}</>}
          </span>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => setConfirmOut(true)}>
          <LogOut size={16} />
          Keluar
        </button>
      </section>

      <h2 className="section-label">Tentang aplikasi</h2>
      <section className="colophon">
        <div className="colophon__mark">
          <img src="/pwa-192x192.png" alt="" width={56} height={56} />
          <div>
            <h2>Rosette</h2>
            <p>Pengolah kata dengan riwayat versi</p>
          </div>
        </div>

        <p className="colophon__lede">
          Setiap tahap tulisan bisa disimpan sebagai versi, dibandingkan kata per kata
          dengan versi lain, lalu dikembalikan kapan saja. Sebelum mengembalikan, isi yang
          sedang terbuka dicadangkan dulu, jadi tidak ada kalimat yang hilang.
        </p>

        <dl className="colophon__meta">
          <dt>Disusun oleh</dt>
          <dd>Muhammad Faris Revansyah</dd>
          <dt>NIM</dt>
          <dd className="mono">21120124130103</dd>
          <dt>Untuk</dt>
          <dd>Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026, Teknik Komputer Undip</dd>
          <dt>Huruf</dt>
          <dd>Cormorant Garamond, Crimson Pro, IBM Plex Mono</dd>
          <dt>Dibangun dengan</dt>
          <dd>React, Vite PWA, TipTap, Express, Supabase</dd>
          <dt>Versi</dt>
          <dd className="mono">1.0.0</dd>
        </dl>

        <Link to="/panduan" className="btn btn--ghost btn--block">
          <BookOpenText size={17} />
          Buka panduan lagi
        </Link>
      </section>

      <ConfirmModal
        open={confirmOut}
        title="Keluar dari Rosette?"
        message="Semua tulisanmu tetap tersimpan di akun. Draft yang belum tersinkron di perangkat ini akan dihapus."
        confirmText="Keluar"
        onConfirm={logout}
        onClose={() => setConfirmOut(false)}
      />
    </>
  );
}
