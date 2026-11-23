import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import BookDetailPage from "./pages/BookDetailPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SnapshotDetailPage from "./pages/SnapshotDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import GuidePage from "./pages/GuidePage.jsx";
import { onboarding } from "./lib/onboarding.js";

// Peta halaman (memenuhi ketentuan TA):
//  List #1  : Pustaka (daftar Book)      -> Detail Book -> Editor Dokumen
//  List #2  : Riwayat (daftar Snapshot)  -> Detail Snapshot (diff + restore)
//  About    : Profil (Kolofon)
//  Tambahan : Panduan pembuka (muncul saat pertama kali dibuka)
export default function App() {
  const { pathname } = useLocation();
  const inGuide = pathname.startsWith("/panduan");

  return (
    <div className={inGuide ? "app app--bare" : "app"}>
      <main className={inGuide ? "app-content app-content--bare" : "app-content"}>
        <Routes>
          <Route
            path="/"
            element={onboarding.isDone() ? <LibraryPage /> : <Navigate to="/panduan" replace />}
          />
          <Route path="/panduan" element={<GuidePage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/documents/:id" element={<EditorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/snapshots/:id" element={<SnapshotDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!inGuide && <BottomNav />}
    </div>
  );
}
