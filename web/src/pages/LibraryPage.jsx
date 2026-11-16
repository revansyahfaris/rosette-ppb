import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

// Halaman utama #1 (list): daftar Book
export default function LibraryPage() {
  const { data: books, loading, error, reload } = useFetch(() => api.books.list());

  return (
    <>
      <PageHeader title="Pustaka" subtitle="Semua buku dan naskahmu" />
      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={books?.length === 0}
        emptyText="Belum ada buku. Buat yang pertama!"
      >
        <ul className="card-list">
          {books?.map((book) => (
            <li key={book.id}>
              <Link to={`/books/${book.id}`} className="card">
                <span className="card__icon" style={{ background: book.cover_color || "var(--rose-700)" }}>
                  <BookOpen size={20} color="#fff" />
                </span>
                <span className="card__body">
                  <strong>{book.name}</strong>
                  <small>
                    {book.document_count} dokumen · {formatDate(book.updated_at)}
                  </small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StateView>
      {/* TODO: tombol + Buat Book (modal/form) */}
    </>
  );
}
