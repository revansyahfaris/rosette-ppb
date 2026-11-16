import { useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch, formatDate } from "../lib/useFetch.js";

// Detail Snapshot
// TODO berikutnya: tampilan diff (library `diff`) terhadap snap.previous,
//                  tombol "Kembalikan ke versi ini" (POST /restore).
export default function SnapshotDetailPage() {
  const { id } = useParams();
  const { data: snap, loading, error, reload } = useFetch(() => api.snapshots.get(id), [id]);

  return (
    <>
      <PageHeader
        back
        title={snap?.message ?? "Versi"}
        subtitle={snap ? `${snap.documents?.title} · ${formatDate(snap.created_at)}` : undefined}
      />
      <StateView loading={loading} error={error} onRetry={reload}>
        <article className="prose" dangerouslySetInnerHTML={{ __html: snap?.content ?? "" }} />
      </StateView>
    </>
  );
}
