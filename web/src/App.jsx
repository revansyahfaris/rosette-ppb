import { Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import BookDetailPage from "./pages/BookDetailPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SnapshotDetailPage from "./pages/SnapshotDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Peta halaman (memenuhi ketentuan TA):
//  List #1  : Pustaka (daftar Book)      -> Detail Book -> Editor Dokumen
//  List #2  : Riwayat (daftar Snapshot)  -> Detail Snapshot (diff + restore)
//  About    : Profil
export default function App() {
  return (
    <div className="app">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/documents/:id" element={<EditorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/snapshots/:id" element={<SnapshotDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
