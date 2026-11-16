import { diffWords } from "diff";
import { htmlToText } from "../lib/html.js";

// Tampilkan perbedaan dua isi dokumen per kata: hijau = ditambah, merah dicoret = dihapus
export default function DiffView({ before = "", after = "", emptyText = "Tidak ada perubahan." }) {
  const parts = diffWords(htmlToText(before), htmlToText(after));
  const count = (key) =>
    parts
      .filter((p) => p[key])
      .reduce((n, p) => n + (p.value.trim() ? p.value.trim().split(/\s+/).length : 0), 0);
  const added = count("added");
  const removed = count("removed");

  if (added === 0 && removed === 0) return <p className="state">{emptyText}</p>;

  return (
    <div>
      <div className="diff-stats">
        <span className="diff-stats__add">+{added} kata</span>
        <span className="diff-stats__del">−{removed} kata</span>
      </div>
      <div className="diff">
        {parts.map((p, i) =>
          p.added ? (
            <ins key={i}>{p.value}</ins>
          ) : p.removed ? (
            <del key={i}>{p.value}</del>
          ) : (
            <span key={i}>{p.value}</span>
          )
        )}
      </div>
    </div>
  );
}
