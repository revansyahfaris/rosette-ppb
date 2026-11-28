import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { History, Pencil, Trash2, GitCommitHorizontal, CloudOff, Check, Loader2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import StateView from "../components/StateView.jsx";
import EditorToolbar from "../components/EditorToolbar.jsx";
import PromptModal from "../components/PromptModal.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../lib/api.js";
import { drafts } from "../lib/drafts.js";
import { formatDate } from "../lib/useFetch.js";

const AUTOSAVE_DELAY = 1200; // ms setelah berhenti mengetik

function countWords(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

// Detail Dokumen = Editor. Autosave ke API, draft lokal saat offline, dan "Simpan Versi".
export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | offline | error
  const [words, setWords] = useState(0);
  const [localDraft, setLocalDraft] = useState(null);

  const [commitOpen, setCommitOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const idRef = useRef(id);
  const pending = useRef(null); // isi terbaru yang belum tersinkron ke API
  const timer = useRef(null);
  idRef.current = id;

  // Kirim isi terbaru ke API. Mengembalikan true kalau semua sudah tersinkron.
  const sync = useCallback(async () => {
    clearTimeout(timer.current);
    const content = pending.current;
    if (content == null) return true;
    const docId = idRef.current;
    setStatus("saving");
    try {
      const updated = await api.documents.update(docId, { content });
      if (pending.current === content) {
        pending.current = null;
        drafts.clear(docId);
        setStatus("saved");
      }
      setDoc((d) => (d && d.id === docId ? { ...d, content, updated_at: updated.updated_at } : d));
      return pending.current == null;
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
      return false;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Placeholder.configure({ placeholder: "Mulai menulis di sini…" }),
    ],
    content: "",
    editorProps: { attributes: { class: "editor-content", spellcheck: "false" } },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      setWords(countWords(e.getText()));
      pending.current = html;
      drafts.save(idRef.current, html); // aman di perangkat walau offline
      setStatus("dirty");
      // clearTimeout(timer.current);
      // timer.current = setTimeout(sync, AUTOSAVE_DELAY);
    },
  });

  // Muat dokumen
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLocalDraft(null);
    pending.current = null;
    api.documents
      .get(id)
      .then((d) => {
        if (cancelled) return;
        // setDoc(d);
        // // Ada draft lokal yang lebih baru dan berbeda dari server? Tawarkan ke pengguna.
        // const draft = drafts.load(id);
        // if (draft && draft.content !== d.content && draft.savedAt > Date.parse(d.updated_at)) {
        //   setLocalDraft(draft);
        // } else if (draft) {
        //   drafts.clear(id);
        // }
                // Perubahan lokal (belum disimpan versi) dipakai sebagai isi editor
        const draft = drafts.load(id);
        if (draft && draft.content !== d.content) {
          pending.current = draft.content;
          setDoc({ ...d, content: draft.content });
        } else {
          if (draft) drafts.clear(id);
          setDoc(d);
        }
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Isi editor setelah dokumen dimuat
  useEffect(() => {
    if (!editor || !doc || doc.id !== id) return;
    editor.commands.setContent(doc.content || "", { emitUpdate: false });
    setWords(countWords(editor.getText()));
    // setStatus("saved");
    setStatus(pending.current != null ? "dirty" : "saved");
    // Hanya saat dokumen berganti, bukan setiap autosave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, doc?.id]);

  // Sinkron ulang otomatis saat kembali online, dan sebelum meninggalkan halaman
  // useEffect(() => {
  //   const onOnline = () => sync();
  //   const onHide = () => document.visibilityState === "hidden" && sync();
  //   window.addEventListener("online", onOnline);
  //   document.addEventListener("visibilitychange", onHide);
  //   return () => {
  //     window.removeEventListener("online", onOnline);
  //     document.removeEventListener("visibilitychange", onHide);
  //     sync(); // simpan sisa perubahan saat pindah halaman
  //   };
  // }, [sync]);

  const applyDraft = () => {
    editor.commands.setContent(localDraft.content, { emitUpdate: false });
    setWords(countWords(editor.getText()));
    pending.current = localDraft.content;
    setLocalDraft(null);
    sync();
  };

  const discardDraft = () => {
    drafts.clear(id);
    setLocalDraft(null);
  };

  const commit = async (message) => {
    const synced = await sync();
    if (!synced) {
      toast("Belum bisa simpan versi: perubahan belum tersinkron (offline?)", "error");
      return;
    }
    try {
      await api.snapshots.create({ document_id: id, message });
      setDoc((d) => ({ ...d, snapshot_count: (d.snapshot_count ?? 0) + 1 }));
      setCommitOpen(false);
      toast("Versi tersimpan");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const rename = async (title) => {
    try {
      await api.documents.update(id, { title });
      setDoc((d) => ({ ...d, title }));
      setRenameOpen(false);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      clearTimeout(timer.current);
      pending.current = null;
      await api.documents.remove(id);
      drafts.clear(id);
      toast("Dokumen dihapus");
      navigate(`/books/${doc.book_id}`, { replace: true });
    } catch (err) {
      toast(err.message, "error");
      setDeleting(false);
    }
  };

  const statusView = {
    // saved: { icon: Check, text: "Tersimpan" },
    // dirty: { icon: Loader2, text: "Mengetik…" },
    // saving: { icon: Loader2, text: "Menyimpan…", spin: true },
    saved: { icon: Check, text: "Tidak ada perubahan lokal" },
    dirty: { icon: Pencil, text: "Perubahan lokal, belum disimpan versi" },
    saving: { icon: Loader2, text: "Menyimpan versi…", spin: true },
    offline: { icon: CloudOff, text: "Offline, aman di perangkat" },
    error: { icon: CloudOff, text: "Belum tersinkron" },
  }[status];

  return (
    <>
      <PageHeader
        back={doc ? `/books/${doc.book_id}` : true}
        title={doc?.title ?? "Dokumen"}
        subtitle={doc?.books?.name}
        actions={
          doc && (
            <>
              <button className="icon-btn" onClick={() => setRenameOpen(true)} aria-label="Ganti judul">
                <Pencil size={19} />
              </button>
              <Link className="icon-btn" to={`/history?document=${id}`} aria-label="Riwayat versi">
                <History size={19} />
              </Link>
              <button className="icon-btn" onClick={() => setDeleteOpen(true)} aria-label="Hapus dokumen">
                <Trash2 size={19} />
              </button>
            </>
          )
        }
      />

      <StateView loading={loading} error={error}>
        {localDraft && (
          <div className="banner">
            <p>
              Ada perubahan di perangkat ini yang belum tersinkron ({formatDate(new Date(localDraft.savedAt).toISOString())}).
            </p>
            <div className="banner__actions">
              <button className="btn btn--ghost btn--sm" onClick={discardDraft}>
                Buang
              </button>
              <button className="btn btn--sm" onClick={applyDraft}>
                Pakai draft ini
              </button>
            </div>
          </div>
        )}

        <div className="editor-bar">
          <div className="editor-bar__info">
            <span className={`save-status save-status--${status}`}>
              <statusView.icon size={14} className={statusView.spin ? "spin" : ""} />
              {statusView.text}
            </span>
            <span className="editor-bar__meta">
              {words} kata · {doc?.snapshot_count ?? 0} versi
            </span>
          </div>
          <button className="btn btn--sm" onClick={() => setCommitOpen(true)} disabled={!editor}>
            <GitCommitHorizontal size={16} />
            Simpan versi
          </button>
        </div>

        <div className="editor-shell">
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </StateView>

      <PromptModal
        open={commitOpen}
        title="Simpan Versi"
        label="Apa yang berubah?"
        placeholder="mis. Revisi paragraf pembuka"
        hint="Versi adalah salinan dokumen saat ini. Kamu bisa membandingkan dan mengembalikannya kapan saja dari tab Riwayat."
        submitText="Simpan Versi"
        onClose={() => setCommitOpen(false)}
        onSubmit={commit}
      />
      <PromptModal
        open={renameOpen}
        title="Ganti Judul"
        label="Judul dokumen"
        initialValue={doc?.title ?? ""}
        onClose={() => setRenameOpen(false)}
        onSubmit={rename}
      />
      <ConfirmModal
        open={deleteOpen}
        title="Hapus dokumen?"
        message={`“${doc?.title}” dan ${doc?.snapshot_count ?? 0} versinya akan dihapus permanen.`}
        confirmText="Hapus"
        danger
        busy={deleting}
        onConfirm={remove}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
