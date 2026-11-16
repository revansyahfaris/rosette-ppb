import { BookModel } from "../models/bookModel.js";
import { statusFromError } from "../utils/text.js";

export const BookController = {
  async getAll(req, res) {
    try {
      const books = await BookModel.getAll();
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const book = await BookModel.getById(req.params.id);
      res.json(book);
    } catch (err) {
      res.status(statusFromError(err, 404)).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, description, cover_color } = req.body ?? {};
      if (!name?.trim()) {
        return res.status(400).json({ error: "Field 'name' wajib diisi" });
      }
      // Hanya kirim field yang diisi, supaya default dari database (cover_color) tetap terpakai
      const payload = { name: name.trim() };
      if (description !== undefined) payload.description = description;
      if (cover_color) payload.cover_color = cover_color;
      const book = await BookModel.create(payload);
      res.status(201).json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { name, description, cover_color } = req.body ?? {};
      const payload = {};
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (cover_color !== undefined) payload.cover_color = cover_color;
      const book = await BookModel.update(req.params.id, payload);
      res.json(book);
    } catch (err) {
      res.status(statusFromError(err)).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await BookModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
