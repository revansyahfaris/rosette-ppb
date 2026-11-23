import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { SnapshotDetail } from "./SnapshotDetailPage.jsx";
import { useMediaQuery, WIDE } from "../lib/useMediaQuery.js";
import StateView from "../components/StateView.jsx";
import { api } from "../lib/api.js";
import {
  useFetch,
  formatDay,
  formatShort,
  formatTime,
  shortId,
  formatNumber,
} from "../lib/useFetch.js";

const isAuto = (snap) => snap.message?.startsWith("Otomatis:");
const bookOf = (snap) => snap.documents?.books;

// Kelompokkan berurutan (data dari API sudah urut terbaru dulu)
function groupBy(snapshots, keyOf, labelOf) {
  const groups = new Map();
  for (const snap of snapshots) {
    const key = keyOf(snap);
    if (!groups.has(key)) groups.set(key, { key, label: labelOf(snap), items: [] });
    groups.get(key).items.push(snap);
  }
  return [...groups.values()];
}

function Commit({ snap, to, selected, showDoc, showBook, showDate }) {
  const book = bookOf(snap);
  return (
    <li
      className={`commit ${isAuto(snap) ? "commit--auto" : ""} ${selected ? "is-selected" : ""}`}
      style={{ "--dot": book?.cover_color || "var(--rose-700)" }}
    >
      <Link to={to} className="commit__link" aria-current={selected ? "true" : undefined}>
        <span className="commit__body">
          <strong>{snap.message}</strong>
          {(showDoc || showBook) && (
            <span className="commit__doc">
              {showDoc && snap.documents?.title}
              {showDoc && showBook && " · "}
              {showBook && <em>{book?.name}</em>}
            </span>
          )}
        </span>
        <span className="commit__meta">
          <code>{shortId(snap.id)}</code>
          <span>{showDate ? formatShort(snap.created_at) : formatTime(snap.created_at)}</span>
          <span>{formatNumber(snap.word_count)} kt</span>
        </span>
      </Link>
    </li>
  );
}

// Halaman utama #2 (list): riwayat versi.
//   tanpa filter      -> semua buku, per hari, titik berwarna sampul buku
//   ?book=<id>        -> satu buku, dikelompokkan per naskah
//   ?document=<id>    -> satu naskah, per hari
export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const bookId = params.get("book") || undefined;
  const documentId = params.get("document") || undefined;
  const selectedId = params.get("snap") || undefined;
  const wide = useMediaQuery(WIDE);

  // Di layar lebar, versi dibuka di panel kanan (?snap=id). Di HP, pindah ke halaman detail.
  const linkFor = (snap) => {
    if (!wide) return `/snapshots/${snap.id}`;
    const next = new URLSearchParams(params);
    next.set("snap", snap.id);
    return `/history?${next.toString()}`;
  };
  const closeDetail = () => {
    const next = new URLSearchParams(params);
    next.delete("snap");
    setParams(next, { replace: true });
  };

  const { data: snapshots, loading, error, reload } = useFetch(
    () => api.snapshots.list({ documentId, bookId: documentId ? undefined : bookId }),
    [documentId, bookId]
  );
  const { data: books } = useFetch(() => api.books.list());
  const { data: filterDoc } = useFetch(
    () => (documentId ? api.documents.get(documentId) : Promise.resolve(null)),
    [documentId]
  );

  const list = snapshots ?? [];
  const activeBook = books?.find((b) => b.id === bookId);

  let groups;
  if (bookId && !documentId) {
    groups = groupBy(list, (s) => s.document_id, (s) => s.documents?.title ?? "Naskah");
  } else {
    groups = groupBy(list, (s) => formatDay(s.created_at), (s) => formatDay(s.created_at));
  }

  const subtitle = documentId
    ? `${list.length} versi dari satu naskah`
    : activeBook
      ? `${list.length} versi di “${activeBook.name}”`
      : `${list.length} versi dari semua buku`;

  return (
    <>
      <PageHeader title="Riwayat" subtitle={snapshots ? subtitle : "Log semua versi"} />

      <div className={wide ? "split" : undefined}>
        <div className="split__list">
        {documentId ? (
          <div className="chips">
            <button
              className="chip is-active"
              onClick={() => setParams(filterDoc?.book_id ? { book: filterDoc.book_id } : {})}
              aria-label="Hapus filter naskah"
            >
              {filterDoc?.title ?? "…"}
              <X size={14} />
            </button>
          </div>
        ) : (
          books?.length > 0 && (
            <div className="chips chips--scroll" role="tablist" aria-label="Filter buku">
              <button
                role="tab"
                aria-selected={!bookId}
                className={`chip ${!bookId ? "is-active" : ""}`}
                onClick={() => setParams({})}
              >
                Semua
              </button>
              {books.map((b) => (
                <button
                  key={b.id}
                  role="tab"
                  aria-selected={bookId === b.id}
                  className={`chip ${bookId === b.id ? "is-active" : ""}`}
                  onClick={() => setParams({ book: b.id })}
                >
                  <span className="chip__swatch" style={{ background: b.cover_color || "#7a1f2b" }} />
                  {b.name}
                </button>
              ))}
            </div>
          )
        )}

        <StateView
          loading={loading}
          error={error}
          onRetry={reload}
          empty={list.length === 0}
          emptyText={
            bookId ? "Belum ada versi di buku ini." : "Belum ada versi. Simpan versi pertama dari editor."
          }
        >
          {groups.map((group) => (
            <section key={group.key} className="log-day">
              <h2 className="section-label">
                {bookId && !documentId ? (
                  <button
                    className="section-label__link"
                    onClick={() => setParams({ document: group.key })}
                  >
                    {group.label} · {group.items.length} versi
                  </button>
                ) : (
                  group.label
                )}
              </h2>
              <ol className="log">
                {group.items.map((snap) => (
                  <Commit
                    key={snap.id}
                    snap={snap}
                    to={linkFor(snap)}
                    selected={wide && snap.id === selectedId}
                    showDoc={!documentId && !bookId}
                    showBook={!documentId && !bookId}
                    showDate={bookId && !documentId}
                  />
                ))}
              </ol>
            </section>
          ))}
        </StateView>
        </div>

        {wide && (
          <aside className="split__detail" aria-label="Detail versi">
            {selectedId ? (
              <SnapshotDetail
                key={selectedId}
                id={selectedId}
                embedded
                onDeleted={() => {
                  closeDetail();
                  reload();
                }}
              />
            ) : (
              <p className="state split__empty">Pilih satu versi di kiri untuk melihat perubahannya.</p>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
