import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import Fab from "../components/Fab.jsx";
import BookForm from "../components/BookForm.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatShort } from "../lib/useFetch.js";

// Halaman utama #1 (list): daftar Book, ditampilkan sebagai sampul buku di rak
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
      <PageHeader
        title="Pustaka"
        subtitle={books ? `${books.length} buku di rak` : "Semua buku dan naskahmu"}
      />

      {books?.length > 3 && (
        <label className="search">
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul buku"
          />
        </label>
      )}

      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={filtered.length === 0}
        emptyText={query ? "Tidak ada buku dengan judul itu." : "Rak masih kosong. Mulai dari satu buku."}
      >
        <ul className="shelf">
          {filtered.map((book) => (
            <li key={book.id}>
              <Link
                to={`/books/${book.id}`}
                className="cover"
                style={{ "--cover": book.cover_color || "#7a1f2b" }}
              >
                <span className="cover__title">{book.name}</span>
                <span className="cover__meta">
                  {book.document_count} naskah
                  <br />
                  {formatShort(book.updated_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StateView>

      <Fab label="Buku baru" onClick={() => setFormOpen(true)} />
      <BookForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={createBook} />
    </>
  );
}
