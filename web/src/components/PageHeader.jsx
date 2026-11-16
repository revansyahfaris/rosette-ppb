import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// `back` bisa true (kembali ke halaman sebelumnya) atau path tujuan, mis. "/books/123"
export default function PageHeader({ title, subtitle, back = false, actions }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (typeof back === "string") navigate(back);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <header className="page-header">
      {back && (
        <button className="icon-btn" onClick={goBack} aria-label="Kembali">
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
