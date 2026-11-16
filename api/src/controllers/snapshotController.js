import { SnapshotModel } from "../models/snapshotModel.js";
import { statusFromError } from "../utils/text.js";

export const SnapshotController = {
  // GET /api/snapshots?document_id=...
  async getAll(req, res) {
    try {
      const snapshots = await SnapshotModel.getAll({
        documentId: req.query.document_id,
      });
      res.json(snapshots);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const snapshot = await SnapshotModel.getById(req.params.id);
      res.json(snapshot);
    } catch (err) {
      res.status(statusFromError(err, 404)).json({ error: err.message });
    }
  },

  // POST /api/snapshots  { document_id, message }  -> "commit"
  async create(req, res) {
    try {
      const { document_id, message } = req.body ?? {};
      if (!document_id || !message?.trim()) {
        return res
          .status(400)
          .json({ error: "Field 'document_id' dan 'message' wajib diisi" });
      }
      const snapshot = await SnapshotModel.create({
        document_id,
        message: message.trim(),
      });
      res.status(201).json(snapshot);
    } catch (err) {
      res.status(statusFromError(err)).json({ error: err.message });
    }
  },

  // POST /api/snapshots/:id/restore
  async restore(req, res) {
    try {
      const result = await SnapshotModel.restore(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(statusFromError(err)).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await SnapshotModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
