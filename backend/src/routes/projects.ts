import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../errors";
import { requireAuth } from "../middleware/auth";
import { enqueueScan } from "../services/scanQueue";
import { projectStore } from "../storage";
import type { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  repoUrl: z.string().url().optional(),
  retentionDays: z.number().int().min(1).max(365).optional()
});

router.get("/", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const projects = projectStore.listByOwner(user.id);
  res.json({ projects });
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthRequest).user;
    const { name, repoUrl, retentionDays } = createSchema.parse(req.body);
    const project = projectStore.create(user.id, name, repoUrl, retentionDays ?? 30);
    res.status(201).json({ project });
  })
);

router.get("/:id", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const project = projectStore.findById(req.params.id);
  if (!project || project.ownerId !== user.id) {
    throw new HttpError(404, "Project not found");
  }
  res.json({ project });
});

router.delete("/:id", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  const project = projectStore.findById(req.params.id);
  if (!project || project.ownerId !== user.id) {
    throw new HttpError(404, "Project not found");
  }
  projectStore.remove(project.id);
  res.status(204).send();
});

const scanSchema = z.object({
  branch: z.string().min(1).optional()
});

router.post(
  "/:id/scans",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthRequest).user;
    const project = projectStore.findById(req.params.id);
    if (!project || project.ownerId !== user.id) {
      throw new HttpError(404, "Project not found");
    }
    const { branch } = scanSchema.parse(req.body);
    const scan = await enqueueScan(project, branch);
    res.status(202).json({ scan });
  })
);

export default router;
