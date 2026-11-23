import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RotateCcw, Trash2, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import DiffView from "../components/DiffView.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { drafts } from "../lib/drafts.js";
import { useFetch, formatDate, shortId, formatNumber } from "../lib/useFetch.js";

const TABS = [
  { key: "changes", label: "Perubahan" },
  { key: "current", label: "vs Sekarang" },
  { key: "content", label: "Isi Versi" },
];

// Halaman Detail Snapshot (dipakai di HP dan saat dibuka lewat URL langsung)
export default function SnapshotDetailPage() {
  const { id } = useParams();
  return <SnapshotDetail key={id} id={id} />;
}

// Isi detail snapshot: diff terhadap versi sebelumnya / isi sekarang, restore, hapus.
// `embedded` = ditampilkan sebagai panel kanan di halaman Riwayat (layar lebar).
export function SnapshotDetail({ id, embedded = false, onDeleted }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: snap, loading, error, reload } = useFetch(() => api.snapshots.get(id), [id]);

  const [tab, setTab] = useState("changes");
  const [confirm, setConfirm] = useState(null); // "restore" | "delete" | null
  const [busy, setBusy] = useState(false);

  const doc = snap?.documents;
  const isCurrent = doc && doc.content === snap.content;

  const restore = async () => {
    setBusy(true);
    try {
      await api.snapshots.restore(id);
      drafts.clear(snap.document_id); // draft lokal lama tidak berlaku lagi
      toast("Dokumen dikembalikan ke versi ini");
      navigate(`/documents/${snap.document_id}`);
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.snapshots.remove(id);
      toast("Versi dihapus");
      if (onDeleted) onDeleted(snap);
      else navigate(`/history?document=${snap.document_id}`, { replace: true });
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        back={!embedded}
        title={snap?.message ?? "Versi"}
        subtitle={snap ? formatDate(snap.created_at) : undefined}
        actions={
          snap && (
            <button className="icon-btn" onClick={() => setConfirm("delete")} aria-label="Hapus versi">
              <Trash2 size={19} />
            </button>
          )
        }
      />

      <StateView loading={loading} error={error} onRetry={reload}>
        {snap && (
          <>
            <p className="ledger">
              <code>{shortId(snap.id)}</code>
              <span>{formatNumber(snap.word_count)} kata</span>
              <Link to={`/documents/${snap.document_id}`} className="ledger__link">
                {doc?.title}
                <ArrowUpRight size={14} />
              </Link>
            </p>

            <div className="tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={`tabs__item ${tab === t.key ? "is-active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <section className="panel">
              {tab === "changes" && (
                <>
                  <p className="panel__caption">
                    {snap.previous
                      ? `Dibanding versi sebelumnya: “${snap.previous.message}”`
                      : "Ini versi pertama, semua isi tercatat sebagai tambahan."}
                  </p>
                  <DiffView before={snap.previous?.content ?? ""} after={snap.content} />
                </>
              )}
              {tab === "current" && (
                <>
                  <p className="panel__caption">
                    Yang akan berubah pada dokumen jika kamu mengembalikan ke versi ini.
                  </p>
                  <DiffView
                    before={doc?.content ?? ""}
                    after={snap.content}
                    emptyText="Isi dokumen saat ini sama persis dengan versi ini."
                  />
                </>
              )}
              {tab === "content" && (
                <article className="prose" dangerouslySetInnerHTML={{ __html: snap.content }} />
              )}
            </section>

            <button
              className="btn btn--block"
              onClick={() => setConfirm("restore")}
              disabled={isCurrent}
            >
              <RotateCcw size={17} />
              {isCurrent ? "Dokumen sudah sama dengan versi ini" : "Kembalikan ke Versi Ini"}
            </button>
          </>
        )}
      </StateView>

      <ConfirmModal
        open={confirm === "restore"}
        title="Kembalikan ke versi ini?"
        message="Isi dokumen akan diganti dengan versi ini. Isi saat ini otomatis disimpan sebagai versi cadangan, jadi tidak ada tulisan yang hilang."
        confirmText="Kembalikan"
        busy={busy}
        onConfirm={restore}
        onClose={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === "delete"}
        title="Hapus versi ini?"
        message="Versi ini akan dihapus dari riwayat. Isi dokumen saat ini tidak berubah."
        confirmText="Hapus"
        danger
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
