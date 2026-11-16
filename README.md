# Rosette — Word Processor dengan Version Control

Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026 — **Progressive Web App**.

Muhammad Faris Revansyah · 21120124130103

Rosette adalah aplikasi menulis yang menyimpan setiap tahap tulisan sebagai **versi (snapshot)**,
menampilkan perbedaan antarversi, dan bisa mengembalikan naskah ke versi mana pun.

## Struktur

```
rosette-ppb/
├── api/   REST API — Node.js + Express + Supabase (pola Modul 1)
└── web/   PWA — React + Vite + vite-plugin-pwa + TipTap
```

## Halaman

| Tab (bottom nav) | Halaman | Keterangan |
|---|---|---|
| Pustaka | Daftar Book → Detail Book → Editor Dokumen | List #1 + detail |
| Riwayat | Daftar Snapshot → Detail Snapshot | List #2 + detail (diff, restore) |
| Profil | Tentang aplikasi | Profile/About |

## Menjalankan secara lokal

```bash
# 1) API  (lihat api/README.md untuk setup Supabase)
cd api && cp .env.example .env   # isi SUPABASE_URL & SUPABASE_KEY
npm install && npm run dev       # http://localhost:3000

# 2) Web  (terminal lain)
cd web && cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install && npm run dev       # http://localhost:5173
```

## Deploy (Vercel, gratis)

Buat **dua project Vercel** dari repo yang sama:

| Project | Root Directory | Environment Variables |
|---|---|---|
| rosette-api | `api` | `SUPABASE_URL`, `SUPABASE_KEY` |
| rosette-web | `web` | `VITE_API_URL` = URL project rosette-api |
