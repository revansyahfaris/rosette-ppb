-- =====================================================================
-- Rosette API — Skema Database (Supabase / PostgreSQL)
-- Jalankan SELURUH blok ini sekaligus di Supabase → SQL Editor → RUN.
-- Urutan penting: documents bergantung pada books, snapshots pada documents.
-- =====================================================================

-- Book: wadah tulisan (seperti "repository"), mis. novel atau kumpulan esai
create table books (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  cover_color text default '#7a1f2b',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Document: satu naskah di dalam Book (bab, catatan, dll). Isi = HTML dari editor
create table documents (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references books(id) on delete cascade,
  title       text not null,
  content     text default '',
  word_count  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Snapshot: "commit" — salinan isi dokumen pada satu titik waktu + pesan
create table snapshots (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  message     text not null,
  content     text not null,
  word_count  integer default 0,
  created_at  timestamptz default now()
);

create index idx_documents_book_id     on documents(book_id);
create index idx_snapshots_document_id on snapshots(document_id);

-- ---------------------------------------------------------------------
-- (Opsional) Kalau saat POST muncul error "violates row-level security
-- policy", berarti RLS aktif di project-mu. Jalankan baris di bawah ini:
-- ---------------------------------------------------------------------
-- alter table books     disable row level security;
-- alter table documents disable row level security;
-- alter table snapshots disable row level security;

-- ---------------------------------------------------------------------
-- (Opsional) Data contoh untuk demo
-- ---------------------------------------------------------------------
-- insert into books (name, description) values
--   ('Catatan Kuliah', 'Rangkuman materi semester ganjil'),
--   ('Draft Novel', 'Naskah light novel yang sedang ditulis');
