import type { Express } from "express";
import path from "path";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";

let app: Express;

async function registerUser() {
  const response = await request(app).post("/api/auth/register").send({
    email: "scan@shipguard.io",
    password: "strong-password"
  });
  return response.body.token as string;
}

beforeAll(async () => {
  const mod = await import("../src/app");
  app = mod.createApp();
});

beforeEach(async () => {
  await resetStores();
});

describe("scans", () => {
  it("runs a scan from a local source", async () => {
    const token = await registerUser();
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sample" });

    const projectId = created.body.project.id as string;
    const fixturePath = path.resolve(
      __dirname,
      "fixtures",
      "sample-project"
    );

    await request(app)
      .post(`/api/projects/${projectId}/local-source`)
      .set("Authorization", `Bearer ${token}`)
      .send({ path: fixturePath });

    const scanResponse = await request(app)
      .post(`/api/projects/${projectId}/scans`)
      .set("Authorization", `Bearer ${token}`)
      .send({ sourceType: "local", sourceRef: fixturePath });

    expect(scanResponse.status).toBe(202);
    const scanId = scanResponse.body.scan.id as string;

    const findingsResponse = await request(app)
      .get(`/api/scans/${scanId}/findings`)
      .set("Authorization", `Bearer ${token}`);

    expect(findingsResponse.status).toBe(200);
    expect(findingsResponse.body.findings.length).toBeGreaterThan(0);
  });
});
