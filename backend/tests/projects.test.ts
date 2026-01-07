import type { Express } from "express";
import type { Server } from "http";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";
import { startTestServer, stopTestServer } from "./testServer";

let app: Express;
let server: Server;
let api: request.SuperTest<request.Test>;

async function registerUser() {
  const response = await api.post("/api/auth/register").send({
    email: "owner@shipguard.io",
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

describe("projects", () => {
  it("creates and lists projects", async () => {
    const token = await registerUser();
    const created = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ShipGuard", repoUrl: "https://github.com/acme/shipguard" });

    expect(created.status).toBe(201);
    const list = await api
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.projects.length).toBe(1);
  });
});
