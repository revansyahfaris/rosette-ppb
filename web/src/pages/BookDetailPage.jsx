import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileText, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import Fab from "../components/Fab.jsx";
import BookForm from "../components/BookForm.jsx";
import PromptModal from "../components/PromptModal.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

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
        subtitle={book ? `${docs.length} dokumen · ${totalWords} kata` : undefined}
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

      {book?.description && <p className="lead">{book.description}</p>}

      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={docs.length === 0}
        emptyText="Belum ada dokumen. Ketuk “Dokumen Baru” untuk mulai menulis."
      >
        <ul className="card-list">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Link to={`/documents/${doc.id}`} className="card">
                <span className="card__icon">
                  <FileText size={20} />
                </span>
                <span className="card__body">
                  <strong>{doc.title}</strong>
                  <small>
                    {doc.word_count} kata · diubah {formatDate(doc.updated_at)}
                  </small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StateView>

      {book && <Fab label="Dokumen Baru" onClick={() => setNewDocOpen(true)} />}

      <BookForm
        open={editOpen}
        initial={book}
        onClose={() => setEditOpen(false)}
        onSubmit={updateBook}
      />
      <PromptModal
        open={newDocOpen}
        title="Dokumen Baru"
        label="Judul dokumen"
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
