import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, GitCommitHorizontal } from "lucide-react";
import { useToast } from "../components/Toast.jsx";
import { onboarding } from "../lib/onboarding.js";
import { createSampleBook } from "../lib/sample.js";

// ---------- Ilustrasi kecil: memakai bentuk yang sama dengan halaman aslinya ----------
function ArtWelcome() {
  return (
    <div className="art art--center">
      <img src="/pwa-192x192.png" alt="" width={88} height={88} className="art__logo" />
    </div>
  );
}

function ArtShelf() {
  return (
    <div className="art">
      <ul className="shelf shelf--mini" aria-hidden="true">
        {[
          ["Draft Novel", "#8a1240", "3 naskah"],
          ["Catatan Kuliah", "#2f5d7c", "5 naskah"],
        ].map(([name, color, meta]) => (
          <li key={name}>
            <span className="cover" style={{ "--cover": color }}>
              <span className="cover__title">{name}</span>
              <span className="cover__meta">{meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArtWriting() {
  return (
    <div className="art" aria-hidden="true">
      <div className="mini-sheet">
        <div className="mini-sheet__bar">
          <span className="save-status save-status--saved">
            <Check size={13} /> Tersimpan
          </span>
          <span className="editor-bar__meta">42 kata</span>
        </div>
        <p>
          Hujan turun sejak pagi di kota itu. Rin berdiri di depan toko buku tua
          <span className="caret" />
        </p>
      </div>
    </div>
  );
}

function ArtCommit() {
  return (
    <div className="art" aria-hidden="true">
      <div className="mini-commit-btn">
        <GitCommitHorizontal size={15} /> Simpan versi
      </div>
      <ol className="log log--mini">
        {[
          ["Perjelas paragraf pembuka", "c41e9a2", "10.42"],
          ["Draft pertama", "a4117a3", "09.15"],
        ].map(([msg, hash, time]) => (
          <li key={hash} className="commit">
            <span className="commit__link">
              <span className="commit__body">
                <strong>{msg}</strong>
              </span>
              <span className="commit__meta">
                <code>{hash}</code>
                <span>{time}</span>
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ArtDiff() {
  return (
    <div className="art" aria-hidden="true">
      <div className="diff diff--mini">
        Rin berdiri di depan toko buku <del>tua</del> <ins>yang hampir tutup</ins>.{" "}
        <ins>Ia menunggu seseorang.</ins>
      </div>
    </div>
  );
}

const STEPS = [
  {
    art: ArtWelcome,
    title: "Selamat datang di Rosette",
    body: "Pengolah kata yang mengingat setiap tahap tulisanmu. Panduan ini singkat, cuma lima halaman.",
  },
  {
    art: ArtShelf,
    title: "Buku di rak",
    body: "Buku adalah wadah naskah, misalnya satu novel atau satu mata kuliah. Ketuk sampulnya untuk membuka daftar isi, lalu tambah naskah dari sana.",
  },
  {
    art: ArtWriting,
    title: "Tulis saja, sisanya otomatis",
    body: "Naskah tersimpan sendiri setiap kali kamu berhenti mengetik. Kalau internet putus, tulisan tetap aman di perangkat dan dikirim begitu online lagi.",
  },
  {
    art: ArtCommit,
    title: "Simpan versi di titik penting",
    body: "Selesai satu tahap? Tekan “Simpan versi” dan tulis pesan singkat. Semua versi tercatat di tab Riwayat, seperti log commit.",
  },
  {
    art: ArtDiff,
    title: "Bandingkan dan kembalikan",
    body: "Buka satu versi untuk melihat perubahan kata per kata. Kalau ingin kembali, isi yang sekarang dicadangkan dulu, jadi tidak ada kalimat yang hilang.",
  },
];

// Panduan pembuka. Muncul otomatis saat pertama kali, bisa dibuka lagi dari Kolofon.
export default function GuidePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const current = STEPS[step];
  const Art = current.art;
  const isLast = step === STEPS.length - 1;

  const finish = (to = "/") => {
    onboarding.markDone();
    navigate(to, { replace: true });
  };

  const trySample = async () => {
    setBusy(true);
    try {
      const bookId = await createSampleBook();
      toast("Buku contoh siap dijelajahi");
      finish(`/books/${bookId}`);
    } catch (err) {
      toast(`Gagal membuat contoh: ${err.message}`, "error");
      setBusy(false);
    }
  };

  return (
    <div className="guide">
      <div className="guide__top">
        <span className="guide__folio">
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
        {!isLast && (
          <button className="guide__skip" onClick={() => finish()}>
            Lewati
          </button>
        )}
      </div>

      <div className="guide__page" key={step}>
        <Art />
        <h1>{current.title}</h1>
        <p>{current.body}</p>
      </div>

      <div className="guide__progress" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={i <= step ? "is-done" : ""} />
        ))}
      </div>

      <div className="guide__actions">
        {isLast ? (
          <>
            <button className="btn btn--block" onClick={trySample} disabled={busy}>
              {busy ? "Menyiapkan contoh…" : "Coba dengan buku contoh"}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => finish()} disabled={busy}>
              Mulai dari rak kosong
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn--ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              Kembali
            </button>
            <button className="btn" onClick={() => setStep((s) => s + 1)}>
              Lanjut
            </button>
          </>
        )}
      </div>
    </div>
  );
}
