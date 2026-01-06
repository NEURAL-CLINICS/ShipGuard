import { v4 as uuidv4 } from "uuid";
import { Finding, Project, Scan, ScanStatus, User } from "./models";

const now = () => new Date().toISOString();

const users: User[] = [];
const projects: Project[] = [];
const scans: Scan[] = [];
const findings: Finding[] = [];

export const userStore = {
  create(email: string, passwordHash: string): User {
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      createdAt: now()
    };
    users.push(user);
    return user;
  },
  findByEmail(email: string) {
    return users.find((user) => user.email === email);
  },
  findById(id: string) {
    return users.find((user) => user.id === id);
  }
};
function removeFindingsByScanId(scanId: string) {
  for (let i = findings.length - 1; i >= 0; i -= 1) {
    if (findings[i].scanId === scanId) {
      findings.splice(i, 1);
    }
  }
}

export const projectStore = {
  create(ownerId: string, name: string, repoUrl?: string, retentionDays = 30): Project {
    const project: Project = {
      id: uuidv4(),
      ownerId,
      name,
      repoUrl,
      retentionDays,
      createdAt: now()
    };
    projects.push(project);
    return project;
  },
  listByOwner(ownerId: string) {
    return projects.filter((project) => project.ownerId === ownerId);
  },
  findById(id: string) {
    return projects.find((project) => project.id === id);
  },
  remove(id: string) {
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return false;
    }
    projects.splice(index, 1);
    for (let i = scans.length - 1; i >= 0; i -= 1) {
      if (scans[i].projectId === id) {
        const scanId = scans[i].id;
        scans.splice(i, 1);
        removeFindingsByScanId(scanId);
      }
    }
    return true;
  }
};

export const scanStore = {
  create(projectId: string, branch?: string): Scan {
    const scan: Scan = {
      id: uuidv4(),
      projectId,
      status: "queued",
      branch,
      createdAt: now(),
      findingsCount: 0
    };
    scans.push(scan);
    return scan;
  },
  listByProject(projectId: string) {
    return scans.filter((scan) => scan.projectId === projectId);
  },
  findById(id: string) {
    return scans.find((scan) => scan.id === id);
  },
  update(id: string, patch: Partial<Scan>) {
    const scan = scans.find((candidate) => candidate.id === id);
    if (!scan) {
      return undefined;
    }
    Object.assign(scan, patch);
    return scan;
  }
};

export const findingStore = {
  addMany(scanId: string, data: Omit<Finding, "id" | "scanId">[]) {
    const created = data.map((finding) => ({
      id: uuidv4(),
      scanId,
      ...finding
    }));
    findings.push(...created);
    return created;
  },
  listByScan(scanId: string) {
    return findings.filter((finding) => finding.scanId === scanId);
  }
};
