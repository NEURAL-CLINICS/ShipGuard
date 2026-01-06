import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Router } from "express";
import extract from "extract-zip";
import multer from "multer";
import { z } from "zod";
import { config } from "../config";
import { HttpError } from "../errors";
import { requireAuth } from "../middleware/auth";
import { enqueueScan } from "../services/scanQueue";
import { projectStore, scanStore } from "../storage";
import type { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const dataRoot = path.resolve(process.cwd(), config.dataDir);
const rawUploadDir = path.join(dataRoot, "uploads", "raw");
const extractedRoot = path.join(dataRoot, "uploads", "extracted");
fs.mkdirSync(rawUploadDir, { recursive: true });
fs.mkdirSync(extractedRoot, { recursive: true });

const upload = multer({
  dest: rawUploadDir,
  limits: { fileSize: 20 * 1024 * 1024 }
});

const createSchema = z.object({
  name: z.string().min(2),
  repoUrl: z.string().url().optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
  ruleSet: z.string().min(1).optional()
});

const repoSchema = z.object({
  repoUrl: z.string().url()
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  repoUrl: z.string().url().optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
  ruleSet: z.string().min(1).optional()
});

const localSourceSchema = z.object({
  path: z.string().min(1)
});

const scanSchema = z.object({
  branch: z.string().min(1).optional(),
  sourceType: z.enum(["repo", "upload", "local"]).optional(),
  sourceRef: z.string().min(1).optional()
});

async function requireProject(req: AuthRequest) {
  const project = await projectStore.findById(req.params.id);
  if (!project || project.ownerId !== req.user.id) {
    throw new HttpError(404, "Project not found");
  }
  return project;
}

function resolveLocalPath(value: string) {
  const resolved = path.resolve(value);
  if (config.localSourceRoot) {
    const root = path.resolve(config.localSourceRoot);
    if (!resolved.startsWith(root)) {
      throw new HttpError(400, "Local source must be within allowed root");
    }
  }
  return resolved;
}

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const user = (req as AuthRequest).user;
  const projects = await projectStore.listByOwner(user.id);
  res.json({ projects });
}));

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthRequest).user;
    const { name, repoUrl, retentionDays, ruleSet } = createSchema.parse(req.body);
    const project = await projectStore.create(
      user.id,
      name,
      repoUrl,
      retentionDays ?? 30,
      ruleSet ?? "core"
    );
    res.status(201).json({ project });
  })
);

router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const project = await requireProject(req as AuthRequest);
  res.json({ project });
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const project = await requireProject(req as AuthRequest);
  await projectStore.remove(project.id);
  res.status(204).send();
}));

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await requireProject(req as AuthRequest);
    const patch = updateSchema.parse(req.body);
    const updated = await projectStore.update(project.id, patch);
    if (!updated) {
      throw new HttpError(500, "Project update failed");
    }
    res.json({ project: updated });
  })
);

router.get("/:id/scans", requireAuth, asyncHandler(async (req, res) => {
  const project = await requireProject(req as AuthRequest);
  const scans = await scanStore.listByProject(project.id);
  res.json({ scans });
}));

router.post(
  "/:id/repo",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await requireProject(req as AuthRequest);
    const { repoUrl } = repoSchema.parse(req.body);
    const updated = await projectStore.update(project.id, { repoUrl });
    if (!updated) {
      throw new HttpError(500, "Project update failed");
    }
    res.json({ project: updated });
  })
);

router.post(
  "/:id/local-source",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!config.allowLocalSource) {
      throw new HttpError(403, "Local sources are disabled");
    }
    const project = await requireProject(req as AuthRequest);
    const { path: localPath } = localSourceSchema.parse(req.body);
    const resolved = resolveLocalPath(localPath);
    const updated = await projectStore.update(project.id, {
      lastUploadPath: resolved,
      lastUploadAt: new Date().toISOString()
    });
    if (!updated) {
      throw new HttpError(500, "Project update failed");
    }
    res.json({ project: updated });
  })
);

router.post(
  "/:id/archive",
  requireAuth,
  upload.single("archive"),
  asyncHandler(async (req, res) => {
    const project = await requireProject(req as AuthRequest);
    if (!req.file) {
      throw new HttpError(400, "Archive file is required");
    }
    if (!req.file.originalname.endsWith(".zip")) {
      await fsPromises.unlink(req.file.path);
      throw new HttpError(400, "Only .zip archives are supported");
    }
    const targetDir = path.join(extractedRoot, project.id, Date.now().toString());
    await fsPromises.mkdir(targetDir, { recursive: true });
    await extract(req.file.path, { dir: targetDir });
    await fsPromises.unlink(req.file.path);

    const updated = await projectStore.update(project.id, {
      lastUploadPath: targetDir,
      lastUploadAt: new Date().toISOString()
    });
    if (!updated) {
      throw new HttpError(500, "Project update failed");
    }
    res.status(201).json({ project: updated, path: targetDir });
  })
);

router.post(
  "/:id/scans",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await requireProject(req as AuthRequest);
    const { branch, sourceType, sourceRef } = scanSchema.parse(req.body);

    let resolvedSourceType = sourceType;
    let resolvedSourceRef = sourceRef;

    if (!resolvedSourceType) {
      if (project.repoUrl) {
        resolvedSourceType = "repo";
        resolvedSourceRef = project.repoUrl;
      } else if (project.lastUploadPath) {
        resolvedSourceType = "upload";
        resolvedSourceRef = project.lastUploadPath;
      }
    }

    if (!resolvedSourceType || !resolvedSourceRef) {
      throw new HttpError(400, "Project must have a repo or upload before scanning");
    }

    if (resolvedSourceType === "local") {
      if (!config.allowLocalSource) {
        throw new HttpError(403, "Local sources are disabled");
      }
      resolvedSourceRef = resolveLocalPath(resolvedSourceRef);
    }

    if (resolvedSourceType === "upload" && project.lastUploadPath) {
      resolvedSourceRef = project.lastUploadPath;
    }

    const scan = await enqueueScan(project, {
      branch,
      sourceType: resolvedSourceType,
      sourceRef: resolvedSourceRef
    });
    res.status(202).json({ scan });
  })
);

export default router;
