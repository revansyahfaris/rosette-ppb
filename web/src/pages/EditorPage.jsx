import { useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/useFetch.js";

// Detail Dokumen = Editor
// TODO berikutnya: editor TipTap (dari repo Rosette lama), autosave (PUT),
//                  tombol "Simpan Versi" (POST /api/snapshots), draft offline.
export default function EditorPage() {
  const { id } = useParams();
  const { data: doc, loading, error, reload } = useFetch(() => api.documents.get(id), [id]);

  return (
    <>
      <PageHeader
        back
        title={doc?.title ?? "Dokumen"}
        subtitle={doc ? `${doc.books?.name} · ${doc.snapshot_count} versi` : undefined}
      />
      <StateView loading={loading} error={error} onRetry={reload}>
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: doc?.content || "<p><em>Dokumen kosong</em></p>" }}
        />
      </StateView>
    </>
  );
}
