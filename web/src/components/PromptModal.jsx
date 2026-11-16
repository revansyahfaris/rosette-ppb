import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

// Dialog satu isian (judul dokumen baru, pesan snapshot, ganti judul)
export default function PromptModal({
  open,
  title,
  label,
  placeholder,
  initialValue = "",
  submitText = "Simpan",
  hint,
  onClose,
  onSubmit,
}) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setBusy(false);
    }
  }, [open, initialValue]);

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try {
      await onSubmit(value.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>{label}</span>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={120}
            required
          />
        </label>
        {hint && <p className="form__hint">{hint}</p>}
        <button className="btn btn--block" disabled={busy || !value.trim()}>
          {busy ? "Menyimpan…" : submitText}
        </button>
      </form>
    </Modal>
  );
}
