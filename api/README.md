# Rosette API

REST API untuk **Rosette: Word Processor Control Version App** (Tugas Akhir Praktikum PPB 2026).
Dibangun dengan Node.js + Express + Supabase, mengikuti struktur Modul 1 (config → models → controllers → routes).

## Konsep

| Resource | Keterangan |
|---|---|
| **User** | Akun pengguna. Password disimpan sebagai hash bcrypt |
| **Book** | Wadah tulisan, mis. "Draft Novel" atau "Catatan Kuliah" |
| **Document** | Satu naskah di dalam Book. Isinya HTML dari editor |
| **Snapshot** | "Commit": salinan isi dokumen pada satu titik waktu, dengan pesan |

## Autentikasi

Semua endpoint kecuali `register` dan `login` membutuhkan header:

```
Authorization: Bearer <token>
```

Token (JWT, berlaku 30 hari) didapat dari `register` atau `login`. Setiap pengguna hanya
bisa melihat dan mengubah data miliknya sendiri: semua query difilter dengan `user_id`
dari token. Tanpa token atau token tidak valid, API membalas `401`.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Body: `{ name, username, password }` → `{ token, user }` |
| POST | `/api/auth/login` | Body: `{ username, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Data akun pemilik token |

## Endpoint data (butuh token)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/books` | Semua book + `document_count` |
| GET | `/api/books/:id` | Detail book + daftar dokumennya |
| POST | `/api/books` | Body: `{ name, description?, cover_color? }` |
| PUT | `/api/books/:id` | Ubah book |
| DELETE | `/api/books/:id` | Hapus book (dokumen & snapshot ikut terhapus) |
| GET | `/api/documents?book_id=&search=` | Daftar dokumen (tanpa isi) |
| GET | `/api/documents/:id` | Detail dokumen + isi + `snapshot_count` |
| POST | `/api/documents` | Body: `{ book_id, title, content? }` |
| PUT | `/api/documents/:id` | Body: `{ title?, content?, book_id? }` (autosave) |
| DELETE | `/api/documents/:id` | Hapus dokumen |
| GET | `/api/snapshots?document_id=&book_id=` | Riwayat snapshot (tanpa isi), bisa difilter per dokumen atau per buku |
| GET | `/api/snapshots/:id` | Detail snapshot + isi + snapshot sebelumnya (`previous`) untuk diff |
| POST | `/api/snapshots` | **Commit**. Body: `{ document_id, message }` |
| POST | `/api/snapshots/:id/restore` | Kembalikan dokumen ke snapshot (isi saat ini dicadangkan otomatis) |
| DELETE | `/api/snapshots/:id` | Hapus snapshot |

Status code: `200` OK, `201` Created, `400` input salah, `401` belum masuk / token tidak valid,
`404` tidak ditemukan (atau milik pengguna lain), `409` username sudah dipakai, `500` error server.

## Menjalankan secara lokal

1. Buat project baru di [Supabase](https://supabase.com), buka **SQL Editor**, tempel isi `schema.sql`, lalu **RUN**.
   Database lama (sebelum ada fitur login) cukup menjalankan `migration-auth.sql`. Data lama
   otomatis menjadi milik akun pertama yang mendaftar.
2. Salin `.env.example` menjadi `.env`, isi `SUPABASE_URL` (Project Settings → Data API),
   `SUPABASE_KEY` (API Keys → anon public), dan `JWT_SECRET` (string acak panjang, mis. hasil `openssl rand -hex 32`).
3. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Import `Rosette-API.postman_collection.json` ke Postman. Jalankan **Auth → Register** atau
   **Auth → Login** dulu: token otomatis tersimpan di variabel `token` dan dipakai semua request lain.
   Isi variabel `bookId`, `documentId`, `snapshotId` dengan id dari hasil POST.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Vercel → Add New → Project → import repo. Set **Root Directory** ke `api`.
3. Tambahkan Environment Variables `SUPABASE_URL`, `SUPABASE_KEY`, dan `JWT_SECRET`, lalu Deploy.
4. Ganti `baseUrl` di Postman ke URL Vercel untuk verifikasi, mis. `https://rosette-ppb-api.vercel.app`.
