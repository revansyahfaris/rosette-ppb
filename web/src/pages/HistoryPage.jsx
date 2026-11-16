import { Link } from "react-router-dom";
import { GitCommitHorizontal } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

// Halaman utama #2 (list): riwayat snapshot dari semua dokumen
export default function HistoryPage() {
  const { data: snapshots, loading, error, reload } = useFetch(() => api.snapshots.list());

  return (
    <>
      <PageHeader title="Riwayat" subtitle="Semua versi yang pernah disimpan" />
      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={snapshots?.length === 0}
        emptyText="Belum ada versi tersimpan."
      >
        <ul className="card-list">
          {snapshots?.map((snap) => (
            <li key={snap.id}>
              <Link to={`/snapshots/${snap.id}`} className="card">
                <span className="card__icon">
                  <GitCommitHorizontal size={20} />
                </span>
                <span className="card__body">
                  <strong>{snap.message}</strong>
                  <small>
                    {snap.documents?.title} · {formatDate(snap.created_at)}
                  </small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </StateView>
    </>
  );
}
