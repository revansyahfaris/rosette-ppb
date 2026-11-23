import { NavLink, useLocation } from "react-router-dom";
import { Library, History, UserRound } from "lucide-react";

const TABS = [
  { to: "/", label: "Pustaka", icon: Library, match: ["/", "/books", "/documents"] },
  { to: "/history", label: "Riwayat", icon: History, match: ["/history", "/snapshots"] },
  { to: "/profile", label: "Profil", icon: UserRound, match: ["/profile"] },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (match) =>
    match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {/* Merek hanya tampil saat navigasi menjadi sidebar (layar lebar) */}
      <div className="nav-brand" aria-hidden="true">
        <img src="/pwa-192x192.png" alt="" width={36} height={36} />
        <span>Rosette</span>
      </div>
      {TABS.map(({ to, label, icon: Icon, match }) => (
        <NavLink
          key={to}
          to={to}
          className={`bottom-nav__item ${isActive(match) ? "is-active" : ""}`}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
