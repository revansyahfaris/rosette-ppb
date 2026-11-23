import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { signToken } from "../utils/auth.js";
import { statusFromError } from "../utils/text.js";

const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

// Data pengguna yang aman dikirim ke klien (tanpa password_hash)
const publicUser = ({ id, name, username, created_at }) => ({ id, name, username, created_at });

export const AuthController = {
  // POST /api/auth/register  { name, username, password }
  async register(req, res) {
    try {
      const name = req.body?.name?.trim();
      const username = req.body?.username?.trim().toLowerCase();
      const password = req.body?.password ?? "";

      if (!name) return res.status(400).json({ error: "Nama wajib diisi" });
      if (!USERNAME_RE.test(username ?? "")) {
        return res.status(400).json({
          error: "Username 3–30 karakter: huruf kecil, angka, titik, atau garis bawah",
        });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
      }
      if (await UserModel.findByUsername(username)) {
        return res.status(409).json({ error: "Username sudah dipakai" });
      }

      // Password di-hash dengan bcrypt (cost 10), yang disimpan hanya hash-nya
      const password_hash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ name, username, password_hash });

      // Akun pertama mewarisi data yang dibuat sebelum ada fitur login
      if ((await UserModel.count()) === 1) await UserModel.claimOrphans(user.id);

      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      // 23505 = unique violation (dua pendaftaran bersamaan dengan username sama)
      if (err?.code === "23505") return res.status(409).json({ error: "Username sudah dipakai" });
      res.status(statusFromError(err, 500)).json({ error: err.message });
    }
  },

  // POST /api/auth/login  { username, password }
  async login(req, res) {
    try {
      const username = req.body?.username?.trim().toLowerCase();
      const password = req.body?.password ?? "";
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib diisi" });
      }

      const user = await UserModel.findByUsername(username);
      // Pesan sengaja sama untuk username salah atau password salah
      const valid = user && (await bcrypt.compare(password, user.password_hash));
      if (!valid) return res.status(401).json({ error: "Username atau password salah" });

      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      res.status(statusFromError(err, 500)).json({ error: err.message });
    }
  },

  // GET /api/auth/me  (butuh token)
  async me(req, res) {
    try {
      const user = await UserModel.getById(req.user.id);
      res.json(publicUser(user));
    } catch (err) {
      res.status(statusFromError(err, 401)).json({ error: "Akun tidak ditemukan" });
    }
  },
};
