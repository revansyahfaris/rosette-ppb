import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDay, formatTime, shortId, formatNumber } from "../lib/useFetch.js";

const isAuto = (snap) => snap.message?.startsWith("Otomatis:");

// Kelompokkan snapshot per hari (data sudah urut terbaru dulu dari API)
function groupByDay(snapshots = []) {
  const groups = [];
  for (const snap of snapshots) {
    const label = formatDay(snap.created_at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(snap);
    else groups.push({ label, items: [snap] });
  }
  return groups;
}

// Halaman utama #2 (list): riwayat versi sebagai log commit. ?document=<id> untuk satu dokumen.
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
        subtitle={snapshots ? `${snapshots.length} versi tercatat` : "Log semua versi"}
      />

      {documentId && (
        <div className="chips">
          <button className="chip" onClick={() => setParams({})} aria-label="Hapus filter dokumen">
            {docTitle ?? "…"}
            <X size={14} />
          </button>
        </div>
      )}

      <StateView
        loading={loading}
        error={error}
        onRetry={reload}
        empty={snapshots?.length === 0}
        emptyText="Belum ada versi. Simpan versi pertama dari editor."
      >
        {groupByDay(snapshots ?? []).map((group) => (
          <section key={group.label} className="log-day">
            <h2 className="section-label">{group.label}</h2>
            <ol className="log">
              {group.items.map((snap) => (
                <li key={snap.id} className={`commit ${isAuto(snap) ? "commit--auto" : ""}`}>
                  <Link to={`/snapshots/${snap.id}`} className="commit__link">
                    <span className="commit__body">
                      <strong>{snap.message}</strong>
                      {!documentId && <span className="commit__doc">{snap.documents?.title}</span>}
                    </span>
                    <span className="commit__meta">
                      <code>{shortId(snap.id)}</code>
                      <span>{formatTime(snap.created_at)}</span>
                      <span>{formatNumber(snap.word_count)} kt</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </StateView>
    </>
  );
}
