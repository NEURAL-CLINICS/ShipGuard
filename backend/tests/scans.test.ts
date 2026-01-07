import type { Express } from "express";
import type { Server } from "http";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";
import { startTestServer, stopTestServer } from "./testServer";

let app: Express;
let server: Server;
let api: request.SuperTest<request.Test>;

async function registerUser() {
  const response = await api.post("/api/auth/register").send({
    email: "scan@shipguard.io",
    password: "strong-password"
  });
  return response.body.token as string;
}

beforeAll(async () => {
  const mod = await import("../src/app");
  app = mod.createApp();
  server = await startTestServer(app);
  api = request(server);
});

beforeEach(async () => {
  await resetStores();
});

afterAll(async () => {
  await stopTestServer(server);
});

describe("scans", () => {
  it("runs a scan from a local source", async () => {
    const token = await registerUser();
    const created = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sample" });

    const projectId = created.body.project.id as string;
    const fixturePath = path.resolve(
      __dirname,
      "fixtures",
      "sample-project"
    );

    await api
      .post(`/api/projects/${projectId}/local-source`)
      .set("Authorization", `Bearer ${token}`)
      .send({ path: fixturePath });

    const scanResponse = await api
      .post(`/api/projects/${projectId}/scans`)
      .set("Authorization", `Bearer ${token}`)
      .send({ sourceType: "local", sourceRef: fixturePath });

    expect(scanResponse.status).toBe(202);
    const scanId = scanResponse.body.scan.id as string;

    const findingsResponse = await api
      .get(`/api/scans/${scanId}/findings`)
      .set("Authorization", `Bearer ${token}`);

    expect(findingsResponse.status).toBe(200);
    expect(findingsResponse.body.findings.length).toBeGreaterThan(0);
  });
});
