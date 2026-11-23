import jwt from "jsonwebtoken";

const TOKEN_TTL = "30d";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    const err = new Error("JWT_SECRET belum diisi di environment server");
    err.status = 500;
    throw err;
  }
  return value;
}

// Token berisi id dan username pengguna, ditandatangani dengan JWT_SECRET
export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, secret(), {
    expiresIn: TOKEN_TTL,
  });
}

// Middleware: hanya request dengan header "Authorization: Bearer <token>"
// yang valid yang boleh lewat. Id pengguna ditaruh di req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Silakan masuk terlebih dahulu" });
  }
  try {
    const payload = jwt.verify(token, secret());
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    if (err.status === 500) return res.status(500).json({ error: err.message });
    return res.status(401).json({ error: "Sesi berakhir, silakan masuk lagi" });
  }
}
