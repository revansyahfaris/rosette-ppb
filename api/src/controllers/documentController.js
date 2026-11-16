import { DocumentModel } from "../models/documentModel.js";
import { BookModel } from "../models/bookModel.js";
import { statusFromError } from "../utils/text.js";

export const DocumentController = {
  // GET /api/documents?book_id=...&search=...
  async getAll(req, res) {
    try {
      const documents = await DocumentModel.getAll({
        bookId: req.query.book_id,
        search: req.query.search,
      });
      res.json(documents);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const document = await DocumentModel.getById(req.params.id);
      res.json(document);
    } catch (err) {
      res.status(statusFromError(err, 404)).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { book_id, title, content } = req.body ?? {};
      if (!book_id || !title?.trim()) {
        return res
          .status(400)
          .json({ error: "Field 'book_id' dan 'title' wajib diisi" });
      }
      const document = await DocumentModel.create({
        book_id,
        title: title.trim(),
        content,
      });
      await BookModel.touch(book_id);
      res.status(201).json(document);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const document = await DocumentModel.update(req.params.id, req.body ?? {});
      await BookModel.touch(document.book_id);
      res.json(document);
    } catch (err) {
      res.status(statusFromError(err)).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await DocumentModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
