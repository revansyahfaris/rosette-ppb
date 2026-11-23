-- =====================================================================
-- Rosette API — Migrasi: fitur login (akun per pengguna)
-- Jalankan SEKALI di Supabase → SQL Editor → RUN, pada database yang sudah
-- berisi tabel books/documents/snapshots. Pilih "Run without RLS".
--
-- Data lama TIDAK hilang: baris yang belum punya pemilik (user_id kosong)
-- otomatis menjadi milik akun PERTAMA yang mendaftar lewat aplikasi.
-- =====================================================================

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  username      text not null unique,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- Pemilik data. Disimpan di ketiga tabel supaya setiap query cukup
-- difilter dengan user_id (lebih sederhana dan cepat daripada join bertingkat).
alter table books     add column if not exists user_id uuid references users(id) on delete cascade;
alter table documents add column if not exists user_id uuid references users(id) on delete cascade;
alter table snapshots add column if not exists user_id uuid references users(id) on delete cascade;

create index if not exists idx_books_user_id     on books(user_id);
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_snapshots_user_id on snapshots(user_id);
