import { Link } from "react-router-dom";
import { BookOpenText } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

// Halaman Profile/About (isi disusun seperti halaman kolofon di akhir buku)
export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil" subtitle="Tentang Rosette" />

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
    </>
  );
}
