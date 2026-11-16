import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import Fab from "../components/Fab.jsx";
import BookForm from "../components/BookForm.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

// Halaman utama #1 (list): daftar Book
export default function LibraryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: books, loading, error, reload } = useFetch(() => api.books.list());
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = (books ?? []).filter((b) =>
    b.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const createBook = async (payload) => {
    try {
      const book = await api.books.create(payload);
      toast("Buku dibuat");
      setFormOpen(false);
      navigate(`/books/${book.id}`);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <>
      <PageHeader title="Pustaka" subtitle="Semua buku dan naskahmu" />

      {books?.length > 0 && (
        <label className="search">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari buku…"
          />
        </label>
      )}

      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={filtered.length === 0}
        emptyText={query ? "Tidak ada buku yang cocok." : "Belum ada buku. Ketuk “Buku Baru” untuk mulai."}
      >
        <ul className="card-list">
          {filtered.map((book) => (
            <li key={book.id}>
              <Link to={`/books/${book.id}`} className="card">
                <span
                  className="card__icon"
                  style={{ background: book.cover_color || "var(--rose-700)" }}
                >
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

      <Fab label="Buku Baru" onClick={() => setFormOpen(true)} />
      <BookForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={createBook} />
    </>
  );
}
