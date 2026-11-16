import PageHeader from "../components/PageHeader.jsx";

// Halaman Profile/About aplikasi
export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil" subtitle="Tentang Rosette" />
      <section className="about">
        <img src="/pwa-192x192.png" alt="Logo Rosette" width={96} height={96} />
        <h2>Rosette</h2>
        <p className="about__tagline">Word Processor dengan Version Control</p>
        <p>
          Rosette membantu penulis menyimpan setiap tahap tulisannya sebagai versi
          (snapshot), membandingkan perubahan antarversi, dan mengembalikan naskah ke
          versi mana pun tanpa kehilangan tulisan.
        </p>

        <dl className="about__meta">
          <dt>Pengembang</dt>
          <dd>Muhammad Faris Revansyah</dd>
          <dt>NIM</dt>
          <dd>21120124130103</dd>
          <dt>Mata kuliah</dt>
          <dd>Praktikum Pemrograman Perangkat Bergerak 2026</dd>
          <dt>Teknologi</dt>
          <dd>React · Vite PWA · TipTap · Express · Supabase</dd>
          <dt>Versi</dt>
          <dd>1.0.0</dd>
        </dl>
      </section>
    </>
  );
}
