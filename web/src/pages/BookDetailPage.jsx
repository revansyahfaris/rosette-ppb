import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { History, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import Fab from "../components/Fab.jsx";
import BookForm from "../components/BookForm.jsx";
import PromptModal from "../components/PromptModal.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatShort, formatNumber } from "../lib/useFetch.js";

// Detail Book: info buku + daftar dokumen di dalamnya
export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: book, loading, error, reload } = useFetch(() => api.books.get(id), [id]);

  const [editOpen, setEditOpen] = useState(false);
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateBook = async (payload) => {
    try {
      await api.books.update(id, payload);
      toast("Buku diperbarui");
      setEditOpen(false);
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const createDocument = async (title) => {
    try {
      const doc = await api.documents.create({ book_id: id, title });
      setNewDocOpen(false);
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const deleteBook = async () => {
    setDeleting(true);
    try {
      await api.books.remove(id);
      toast("Buku dihapus");
      navigate("/", { replace: true });
    } catch (err) {
      toast(err.message, "error");
      setDeleting(false);
    }
  };

  const docs = book?.documents ?? [];
  const totalWords = docs.reduce((sum, d) => sum + (d.word_count || 0), 0);

  return (
    <>
      <PageHeader
        back="/"
        title={book?.name ?? "Buku"}
        subtitle={book?.description}
        actions={
          book && (
            <>
              <button className="icon-btn" onClick={() => setEditOpen(true)} aria-label="Ubah buku">
                <Pencil size={19} />
              </button>
              <button className="icon-btn" onClick={() => setDeleteOpen(true)} aria-label="Hapus buku">
                <Trash2 size={19} />
              </button>
            </>
          )
        }
      />

      <div className="book-layout">
        <aside className="book-layout__aside">
          {book && (
            <span
              className="cover cover--hero"
              style={{ "--cover": book.cover_color || "#7a1f2b" }}
              aria-hidden="true"
            >
              <span className="cover__title">{book.name}</span>
              <span className="cover__meta">{docs.length} naskah</span>
            </span>
          )}
          {book && (
            <p className="ledger">
              <span>{docs.length} naskah</span>
              <span>{formatNumber(totalWords)} kata</span>
              <Link to={`/history?book=${id}`} className="ledger__link">
                <History size={14} />
                Riwayat buku ini
              </Link>
            </p>
          )}
        </aside>

        <div className="book-layout__main">
          <StateView
            loading={loading}
            error={error}
            onRetry={reload}
            empty={docs.length === 0}
            emptyText="Belum ada naskah di buku ini."
          >
            <h2 className="section-label">Daftar isi</h2>
            <ol className="toc">
              {docs.map((doc, i) => (
                <li key={doc.id}>
                  <Link to={`/documents/${doc.id}`} className="toc__row">
                    <span className="toc__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="toc__title">{doc.title}</span>
                    <span className="toc__leader" aria-hidden="true" />
                    <span className="toc__count">{formatNumber(doc.word_count)}</span>
                  </Link>
                  <span className="toc__sub">diubah {formatShort(doc.updated_at)}</span>
                </li>
              ))}
            </ol>
          </StateView>
        </div>
      </div>

      {book && <Fab label="Naskah baru" onClick={() => setNewDocOpen(true)} />}

      <BookForm
        open={editOpen}
        initial={book}
        onClose={() => setEditOpen(false)}
        onSubmit={updateBook}
      />
      <PromptModal
        open={newDocOpen}
        title="Naskah Baru"
        label="Judul naskah"
        placeholder="mis. Bab 1 - Pendahuluan"
        submitText="Buat & Mulai Menulis"
        onClose={() => setNewDocOpen(false)}
        onSubmit={createDocument}
      />
      <ConfirmModal
        open={deleteOpen}
        title="Hapus buku?"
        message={`“${book?.name}” beserta ${docs.length} dokumen dan seluruh riwayat versinya akan dihapus permanen.`}
        confirmText="Hapus"
        danger
        busy={deleting}
        onConfirm={deleteBook}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
