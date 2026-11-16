import express from "express";
import { SnapshotController } from "../controllers/snapshotController.js";

const router = express.Router();

router.get("/", SnapshotController.getAll);
router.get("/:id", SnapshotController.getById);
router.post("/", SnapshotController.create);
router.post("/:id/restore", SnapshotController.restore);
router.delete("/:id", SnapshotController.remove);

export default router;
