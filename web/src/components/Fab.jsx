import { Plus } from "lucide-react";

// Tombol tambah melayang di atas bottom nav
export default function Fab({ label, onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label={label}>
      <Plus size={22} />
      <span>{label}</span>
    </button>
  );
}
