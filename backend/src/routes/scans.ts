import { Router } from "express";
import { HttpError } from "../errors";
import { requireAuth } from "../middleware/auth";
import { findingStore, projectStore, scanStore } from "../storage";
import type { AuthRequest } from "../types";
const router = Router();

router.get("/:id", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const scan = scanStore.findById(req.params.id);
  if (!scan) {
    throw new HttpError(404, "Scan not found");
  }
  const project = projectStore.findById(scan.projectId);
  if (!project || project.ownerId !== user.id) {
    throw new HttpError(404, "Scan not found");
  }
  res.json({ scan });
});

router.get("/:id/findings", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const scan = scanStore.findById(req.params.id);
  if (!scan) {
    throw new HttpError(404, "Scan not found");
  }
  const project = projectStore.findById(scan.projectId);
  if (!project || project.ownerId !== user.id) {
    throw new HttpError(404, "Scan not found");
  }
  const findings = findingStore.listByScan(scan.id);
  res.json({ findings });
});

export default router;
