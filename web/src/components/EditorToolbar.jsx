import { useEditorState } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Undo2, Redo2,
} from "lucide-react";

// Toolbar format teks. useEditorState membuat tombol aktif ikut ter-update.
export default function EditorToolbar({ editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !state) return null;
  const run = (fn) => () => fn(editor.chain().focus()).run();

  const buttons = [
    { icon: Bold, label: "Tebal", active: state.bold, onClick: run((c) => c.toggleBold()) },
    { icon: Italic, label: "Miring", active: state.italic, onClick: run((c) => c.toggleItalic()) },
    { icon: Underline, label: "Garis bawah", active: state.underline, onClick: run((c) => c.toggleUnderline()) },
    { icon: Strikethrough, label: "Coret", active: state.strike, onClick: run((c) => c.toggleStrike()) },
    "sep",
    { icon: Heading2, label: "Judul", active: state.h2, onClick: run((c) => c.toggleHeading({ level: 2 })) },
    { icon: Heading3, label: "Subjudul", active: state.h3, onClick: run((c) => c.toggleHeading({ level: 3 })) },
    { icon: List, label: "Daftar", active: state.bullet, onClick: run((c) => c.toggleBulletList()) },
    { icon: ListOrdered, label: "Daftar bernomor", active: state.ordered, onClick: run((c) => c.toggleOrderedList()) },
    { icon: Quote, label: "Kutipan", active: state.quote, onClick: run((c) => c.toggleBlockquote()) },
    "sep",
    { icon: Undo2, label: "Urungkan", disabled: !state.canUndo, onClick: run((c) => c.undo()) },
    { icon: Redo2, label: "Ulangi", disabled: !state.canRedo, onClick: run((c) => c.redo()) },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label="Format teks">
      {buttons.map((b, i) =>
        b === "sep" ? (
          <span key={i} className="toolbar__sep" />
        ) : (
          <button
            key={b.label}
            type="button"
            className={`toolbar__btn ${b.active ? "is-active" : ""}`}
            onMouseDown={(e) => e.preventDefault()} // jangan hilangkan fokus/seleksi editor
            onClick={b.onClick}
            disabled={b.disabled}
            aria-label={b.label}
            aria-pressed={!!b.active}
            title={b.label}
          >
            <b.icon size={18} />
          </button>
        )
      )}
    </div>
  );
}
