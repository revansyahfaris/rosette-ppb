import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

export const COVER_COLORS = ["#7a1f2b", "#8a1240", "#b07a3a", "#3f6b4f", "#2f5d7c", "#5b4a8a", "#4a4a4a"];

// Form buat / ubah Book. `initial` diisi kalau mode edit.
export default function BookForm({ open, initial, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COVER_COLORS[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setColor(initial?.cover_color || COVER_COLORS[0]);
    setBusy(false);
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), cover_color: color });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={initial ? "Ubah Buku" : "Buku Baru"} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Nama buku</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Draft Novel"
            maxLength={80}
            required
          />
        </label>
        <label className="field">
          <span>Deskripsi (opsional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tentang apa buku ini?"
            rows={3}
            maxLength={240}
          />
        </label>
        <div className="field">
          <span>Warna sampul</span>
          <div className="swatches">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${c === color ? "is-active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Warna ${c}`}
              />
            ))}
          </div>
        </div>
        <button className="btn btn--block" disabled={busy || !name.trim()}>
          {busy ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Buat Buku"}
        </button>
      </form>
    </Modal>
  );
}
