import { Router } from "express";
import { HttpError } from "../errors";
import { requireAuth } from "../middleware/auth";
import { buildMarkdownReport } from "../services/report";
import { findingStore, projectStore, scanStore } from "../storage";
import type { AuthRequest } from "../types";
const router = Router();
router.get("/projects/:id", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const project = projectStore.findById(req.params.id);
  if (!project || project.ownerId !== user.id) {
    throw new HttpError(404, "Project not found");
  }
  const scans = scanStore.listByProject(project.id);
  const scan = scans[scans.length - 1];
  if (!scan) {
    throw new HttpError(404, "No scans for project");
  }
  const findings = findingStore.listByScan(scan.id);
  const format = String(req.query.format ?? "json").toLowerCase();
  if (format === "md" || format === "markdown") {
    const report = buildMarkdownReport(project, scan, findings);
    res.type("text/markdown").send(report);
    return;
  }
  res.json({ project, scan, findings });
});

export default router;
