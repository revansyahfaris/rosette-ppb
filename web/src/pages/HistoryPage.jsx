import { Link, useSearchParams } from "react-router-dom";
import { GitCommitHorizontal, ShieldCheck, X } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

const isAuto = (snap) => snap.message?.startsWith("Otomatis:");

// Halaman utama #2 (list): riwayat versi. ?document=<id> untuk satu dokumen saja.
export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const documentId = params.get("document") || undefined;
  const { data: snapshots, loading, error, reload } = useFetch(
    () => api.snapshots.list({ documentId }),
    [documentId]
  );

  const { data: filterDoc } = useFetch(
    () => (documentId ? api.documents.get(documentId) : Promise.resolve(null)),
    [documentId]
  );
  const docTitle = filterDoc?.title ?? snapshots?.[0]?.documents?.title;

  return (
    <>
      <PageHeader
        title="Riwayat"
        subtitle={documentId ? "Versi satu dokumen" : "Semua versi yang pernah disimpan"}
      />

      {documentId && (
        <div className="chips">
          <button className="chip" onClick={() => setParams({})}>
            Dokumen: {docTitle ?? "…"}
            <X size={14} />
          </button>
        </div>
      )}

      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={snapshots?.length === 0}
        emptyText="Belum ada versi tersimpan. Tekan “Simpan Versi” di editor untuk membuat versi pertama."
      >
        <ol className="timeline">
          {snapshots?.map((snap) => {
            const Icon = isAuto(snap) ? ShieldCheck : GitCommitHorizontal;
            return (
              <li key={snap.id}>
                <Link to={`/snapshots/${snap.id}`} className={`card ${isAuto(snap) ? "card--auto" : ""}`}>
                  <span className="card__icon">
                    <Icon size={20} />
                  </span>
                  <span className="card__body">
                    <strong>{snap.message}</strong>
                    <small>
                      {!documentId && <>{snap.documents?.title} · </>}
                      {snap.word_count} kata · {formatDate(snap.created_at)}
                    </small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </StateView>
    </>
  );
}
