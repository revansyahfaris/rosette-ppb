import { Link, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

// Detail Book: deskripsi + daftar dokumen di dalamnya
export default function BookDetailPage() {
  const { id } = useParams();
  const { data: book, loading, error, reload } = useFetch(() => api.books.get(id), [id]);

  return (
    <>
      <PageHeader back title={book?.name ?? "Buku"} subtitle={book?.description} />
      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={book?.documents?.length === 0}
        emptyText="Belum ada dokumen di buku ini."
      >
        <ul className="card-list">
          {book?.documents?.map((doc) => (
            <li key={doc.id}>
              <Link to={`/documents/${doc.id}`} className="card">
                <span className="card__icon">
                  <FileText size={20} />
                </span>
                <span className="card__body">
                  <strong>{doc.title}</strong>
                  <small>
                    {doc.word_count} kata · {formatDate(doc.updated_at)}
                  </small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StateView>
      {/* TODO: tombol + Dokumen Baru */}
    </>
  );
}
