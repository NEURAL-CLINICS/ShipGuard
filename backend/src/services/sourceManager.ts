import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { config } from "../config";
import { HttpError } from "../errors";
import type { Project, Scan } from "../models";

const execFileAsync = promisify(execFile);
const dataRoot = path.resolve(process.cwd(), config.dataDir);

type ScanSource = {
  path: string;
  cleanup?: () => Promise<void>;
};

function isHttpUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}

function isFileUrl(value: string) {
  return value.startsWith("file://");
}

export async function prepareScanSource(scan: Scan, project: Project): Promise<ScanSource> {
  if (scan.sourceType === "upload") {
    if (!scan.sourceRef) {
      throw new HttpError(400, "Upload source path missing");
    }
    await fs.stat(scan.sourceRef);
    return { path: scan.sourceRef };
  }

  if (scan.sourceType === "local") {
    if (!config.allowLocalSource) {
      throw new HttpError(403, "Local sources are disabled");
    }
    await fs.stat(scan.sourceRef);
    return { path: scan.sourceRef };
  }

  const repoUrl = scan.sourceRef || project.repoUrl;
  if (!repoUrl) {
    throw new HttpError(400, "Repository URL missing");
  }

  if (isFileUrl(repoUrl)) {
    if (!config.allowLocalSource) {
      throw new HttpError(403, "Local sources are disabled");
    }
    const localPath = repoUrl.replace("file://", "");
    return { path: localPath };
  }

  if (!isHttpUrl(repoUrl) && !repoUrl.startsWith("git@")) {
    throw new HttpError(400, "Unsupported repository URL");
  }

  const repoDir = path.join(dataRoot, "repos", scan.id);
  await fs.mkdir(repoDir, { recursive: true });
  const args = ["clone", "--depth", "1"];
  if (scan.branch) {
    args.push("--branch", scan.branch);
  }
  args.push(repoUrl, repoDir);
  await execFileAsync("git", args);
  return {
    path: repoDir,
    cleanup: async () => {
      await fs.rm(repoDir, { recursive: true, force: true });
    }
  };
}
