import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";

let app: Express;

async function registerUser() {
  const response = await request(app).post("/api/auth/register").send({
    email: "owner@shipguard.io",
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

describe("projects", () => {
  it("creates and lists projects", async () => {
    const token = await registerUser();
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ShipGuard", repoUrl: "https://github.com/acme/shipguard" });

    expect(created.status).toBe(201);
    const list = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.projects.length).toBe(1);
  });
});
