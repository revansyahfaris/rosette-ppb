import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import snapshotRoutes from "./routes/snapshotRoutes.js";

dotenv.config();

const app = express();

// CORS: izinkan PWA (domain berbeda) memanggil API ini
app.use(cors());
// Batas body dinaikkan karena isi dokumen bisa panjang
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "Rosette API",
    status: "ok",
    endpoints: ["/api/books", "/api/documents", "/api/snapshots"],
  });
});

app.use("/api/books", bookRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/snapshots", snapshotRoutes);

// Endpoint yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Di Vercel, server dijalankan sebagai serverless function (tanpa app.listen)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
