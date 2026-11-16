import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PageHeader({ title, subtitle, back = false, actions }) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      {back && (
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Kembali">
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="page-header__text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
