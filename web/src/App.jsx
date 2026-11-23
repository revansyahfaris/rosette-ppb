import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import BookDetailPage from "./pages/BookDetailPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SnapshotDetailPage from "./pages/SnapshotDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import GuidePage from "./pages/GuidePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { onboarding } from "./lib/onboarding.js";
import { useAuth } from "./lib/auth.jsx";

// Peta halaman (memenuhi ketentuan TA):
//  List #1  : Pustaka (daftar Book)      -> Detail Book -> Editor Dokumen
//  List #2  : Riwayat (daftar Snapshot)  -> Detail Snapshot (diff + restore)
//  About    : Profil
//  Tambahan : Masuk, Daftar, Panduan pembuka
const BARE_PATHS = ["/panduan", "/masuk", "/daftar"];

export default function App() {
  const { user, logoutReason } = useAuth();
  const location = useLocation();
  const bare = !user || BARE_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className={bare ? "app app--bare" : "app"}>
      <main className={bare ? "app-content app-content--bare" : "app-content"}>
        {user ? (
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
            {/* Baru saja masuk: kembali ke halaman yang tadi diminta (kalau ada) */}
            <Route path="/masuk" element={<Navigate to={location.state?.from || "/"} replace />} />
            <Route path="/daftar" element={<Navigate to={location.state?.from || "/"} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/masuk" element={<AuthPage mode="login" />} />
            <Route path="/daftar" element={<AuthPage mode="register" />} />
            {/* Belum masuk: halaman lain diarahkan ke Masuk, lalu kembali setelah login */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/masuk"
                  replace
                  state={{
                    from:
                      logoutReason === "manual" || location.pathname === "/"
                        ? "/"
                        : location.pathname + location.search,
                  }}
                />
              }
            />
          </Routes>
        )}
      </main>
      {!bare && <BottomNav />}
    </div>
  );
}
