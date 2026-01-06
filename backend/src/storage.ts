import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
import { Finding, Project, Scan, SourceType, User } from "./models";

const now = () => new Date().toISOString();

const users: User[] = [];
const projects: Project[] = [];
const scans: Scan[] = [];
const findings: Finding[] = [];

const memoryUserStore = {
  async create(email: string, passwordHash: string): Promise<User> {
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      createdAt: now()
    };
    users.push(user);
    return user;
  },
  async findByEmail(email: string) {
    return users.find((user) => user.email === email);
  },
  async findById(id: string) {
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

const memoryProjectStore = {
  async create(
    ownerId: string,
    name: string,
    repoUrl?: string,
    retentionDays = 30,
    ruleSet = "core"
  ): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      ownerId,
      name,
      repoUrl,
      ruleSet,
      retentionDays,
      createdAt: now()
    };
    projects.push(project);
    return project;
  },
  async listByOwner(ownerId: string) {
    return projects.filter((project) => project.ownerId === ownerId);
  },
  async findById(id: string) {
    return projects.find((project) => project.id === id);
  },
  async update(id: string, patch: Partial<Project>) {
    const project = projects.find((candidate) => candidate.id === id);
    if (!project) {
      return undefined;
    }
    Object.assign(project, patch);
    return project;
  },
  async remove(id: string) {
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

const memoryScanStore = {
  async create(
    projectId: string,
    options: { branch?: string; sourceType: SourceType; sourceRef: string }
  ): Promise<Scan> {
    const scan: Scan = {
      id: uuidv4(),
      projectId,
      status: "queued",
      branch: options.branch,
      sourceType: options.sourceType,
      sourceRef: options.sourceRef,
      createdAt: now(),
      findingsCount: 0
    };
    scans.push(scan);
    return scan;
  },
  async listByProject(projectId: string) {
    return scans.filter((scan) => scan.projectId === projectId);
  },
  async findById(id: string) {
    return scans.find((scan) => scan.id === id);
  },
  async update(id: string, patch: Partial<Scan>) {
    const scan = scans.find((candidate) => candidate.id === id);
    if (!scan) {
      return undefined;
    }
    Object.assign(scan, patch);
    return scan;
  }
};

const memoryFindingStore = {
  async addMany(scanId: string, data: Omit<Finding, "id" | "scanId">[]) {
    const created = data.map((finding) => ({
      id: uuidv4(),
      scanId,
      ...finding
    }));
    findings.push(...created);
    return created;
  },
  async listByScan(scanId: string) {
    return findings.filter((finding) => finding.scanId === scanId);
  }
};

function resetMemoryStores() {
  users.length = 0;
  projects.length = 0;
  scans.length = 0;
  findings.length = 0;
}

const memoryStores = {
  userStore: memoryUserStore,
  projectStore: memoryProjectStore,
  scanStore: memoryScanStore,
  findingStore: memoryFindingStore,
  resetStores: resetMemoryStores
};

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    repoUrl: row.repo_url ?? undefined,
    ruleSet: row.rule_set,
    retentionDays: row.retention_days,
    lastUploadPath: row.last_upload_path ?? undefined,
    lastUploadAt: row.last_upload_at ?? undefined,
    createdAt: row.created_at
  };
}

function mapScan(row: any): Scan {
  return {
    id: row.id,
    projectId: row.project_id,
    status: row.status,
    branch: row.branch ?? undefined,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    findingsCount: Number(row.findings_count ?? 0)
  };
}

function mapFinding(row: any): Finding {
  return {
    id: row.id,
    scanId: row.scan_id,
    ruleId: row.rule_id,
    severity: row.severity,
    category: row.category,
    file: row.file,
    line: row.line,
    description: row.description,
    remediation: row.remediation,
    scannerSource: row.scanner_source
  };
}

function createPostgresStores() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required for postgres storage mode");
  }
  const pool = new Pool({ connectionString: config.databaseUrl });

  const userStore = {
    async create(email: string, passwordHash: string): Promise<User> {
      const id = uuidv4();
      const createdAt = now();
      await pool.query(
        "insert into users (id, email, password_hash, created_at) values ($1, $2, $3, $4)",
        [id, email, passwordHash, createdAt]
      );
      return { id, email, passwordHash, createdAt };
    },
    async findByEmail(email: string) {
      const result = await pool.query("select * from users where email = $1", [email]);
      return result.rows[0] ? mapUser(result.rows[0]) : undefined;
    },
    async findById(id: string) {
      const result = await pool.query("select * from users where id = $1", [id]);
      return result.rows[0] ? mapUser(result.rows[0]) : undefined;
    }
  };

  const projectStore = {
    async create(
      ownerId: string,
      name: string,
      repoUrl?: string,
      retentionDays = 30,
      ruleSet = "core"
    ): Promise<Project> {
      const id = uuidv4();
      const createdAt = now();
      await pool.query(
        "insert into projects (id, owner_id, name, repo_url, rule_set, retention_days, created_at) values ($1, $2, $3, $4, $5, $6, $7)",
        [id, ownerId, name, repoUrl ?? null, ruleSet, retentionDays, createdAt]
      );
      return {
        id,
        ownerId,
        name,
        repoUrl,
        ruleSet,
        retentionDays,
        createdAt
      };
    },
    async listByOwner(ownerId: string) {
      const result = await pool.query(
        "select * from projects where owner_id = $1 order by created_at desc",
        [ownerId]
      );
      return result.rows.map(mapProject);
    },
    async findById(id: string) {
      const result = await pool.query("select * from projects where id = $1", [id]);
      return result.rows[0] ? mapProject(result.rows[0]) : undefined;
    },
    async update(id: string, patch: Partial<Project>) {
      const fields: string[] = [];
      const values: Array<string | number | null> = [];
      let index = 1;
      const addField = (column: string, value: string | number | null | undefined) => {
        if (value === undefined) {
          return;
        }
        fields.push(`${column} = $${index}`);
        values.push(value);
        index += 1;
      };
      const hasPatch = (key: keyof Project) =>
        Object.prototype.hasOwnProperty.call(patch, key);
      if (hasPatch("name")) {
        addField("name", patch.name);
      }
      if (hasPatch("repoUrl")) {
        addField("repo_url", patch.repoUrl ?? null);
      }
      if (hasPatch("ruleSet")) {
        addField("rule_set", patch.ruleSet);
      }
      if (hasPatch("retentionDays")) {
        addField("retention_days", patch.retentionDays);
      }
      if (hasPatch("lastUploadPath")) {
        addField("last_upload_path", patch.lastUploadPath ?? null);
      }
      if (hasPatch("lastUploadAt")) {
        addField("last_upload_at", patch.lastUploadAt ?? null);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }
      values.push(id);
      const result = await pool.query(
        `update projects set ${fields.join(", ")} where id = $${index} returning *`,
        values
      );
      return result.rows[0] ? mapProject(result.rows[0]) : undefined;
    },
    async remove(id: string) {
      await pool.query("delete from projects where id = $1", [id]);
      return true;
    }
  };

  const scanStore = {
    async create(
      projectId: string,
      options: { branch?: string; sourceType: SourceType; sourceRef: string }
    ): Promise<Scan> {
      const id = uuidv4();
      const createdAt = now();
      await pool.query(
        "insert into scans (id, project_id, status, branch, source_type, source_ref, created_at, findings_count) values ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          id,
          projectId,
          "queued",
          options.branch ?? null,
          options.sourceType,
          options.sourceRef,
          createdAt,
          0
        ]
      );
      return {
        id,
        projectId,
        status: "queued",
        branch: options.branch,
        sourceType: options.sourceType,
        sourceRef: options.sourceRef,
        createdAt,
        findingsCount: 0
      };
    },
    async listByProject(projectId: string) {
      const result = await pool.query(
        "select * from scans where project_id = $1 order by created_at desc",
        [projectId]
      );
      return result.rows.map(mapScan);
    },
    async findById(id: string) {
      const result = await pool.query("select * from scans where id = $1", [id]);
      return result.rows[0] ? mapScan(result.rows[0]) : undefined;
    },
    async update(id: string, patch: Partial<Scan>) {
      const fields: string[] = [];
      const values: Array<string | number | null> = [];
      let index = 1;
      const addField = (column: string, value: string | number | null | undefined) => {
        if (value === undefined) {
          return;
        }
        fields.push(`${column} = $${index}`);
        values.push(value);
        index += 1;
      };
      const hasPatch = (key: keyof Scan) =>
        Object.prototype.hasOwnProperty.call(patch, key);
      if (hasPatch("status")) {
        addField("status", patch.status);
      }
      if (hasPatch("branch")) {
        addField("branch", patch.branch ?? null);
      }
      if (hasPatch("sourceType")) {
        addField("source_type", patch.sourceType);
      }
      if (hasPatch("sourceRef")) {
        addField("source_ref", patch.sourceRef);
      }
      if (hasPatch("startedAt")) {
        addField("started_at", patch.startedAt ?? null);
      }
      if (hasPatch("finishedAt")) {
        addField("finished_at", patch.finishedAt ?? null);
      }
      if (hasPatch("findingsCount")) {
        addField("findings_count", patch.findingsCount);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }
      values.push(id);
      const result = await pool.query(
        `update scans set ${fields.join(", ")} where id = $${index} returning *`,
        values
      );
      return result.rows[0] ? mapScan(result.rows[0]) : undefined;
    }
  };

  const findingStore = {
    async addMany(scanId: string, data: Omit<Finding, "id" | "scanId">[]) {
      if (data.length === 0) {
        return [];
      }
      const values: Array<string | number> = [];
      const rows = data
        .map((finding, idx) => {
          const id = uuidv4();
          const base = idx * 10;
          values.push(
            id,
            scanId,
            finding.ruleId,
            finding.severity,
            finding.category,
            finding.file,
            finding.line,
            finding.description,
            finding.remediation,
            finding.scannerSource
          );
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`;
        })
        .join(", ");

      const result = await pool.query(
        `insert into findings (id, scan_id, rule_id, severity, category, file, line, description, remediation, scanner_source) values ${rows} returning *`,
        values
      );
      return result.rows.map(mapFinding);
    },
    async listByScan(scanId: string) {
      const result = await pool.query("select * from findings where scan_id = $1", [scanId]);
      return result.rows.map(mapFinding);
    }
  };

  const resetStores = async () => {
    await pool.query("delete from findings");
    await pool.query("delete from scans");
    await pool.query("delete from projects");
    await pool.query("delete from users");
  };

  return { userStore, projectStore, scanStore, findingStore, resetStores };
}

const stores =
  config.storageMode === "postgres" ? createPostgresStores() : memoryStores;

export const userStore = stores.userStore;
export const projectStore = stores.projectStore;
export const scanStore = stores.scanStore;
export const findingStore = stores.findingStore;
export const resetStores = stores.resetStores;
