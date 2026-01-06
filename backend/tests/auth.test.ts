import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";

let app: Express;

beforeAll(async () => {
  const mod = await import("../src/app");
  app = mod.createApp();
});

beforeEach(async () => {
  await resetStores();
});

describe("auth", () => {
  it("registers and logs in", async () => {
    const register = await request(app).post("/api/auth/register").send({
      email: "dev@shipguard.io",
      password: "strong-password"
    });
    expect(register.status).toBe(201);
    expect(register.body.token).toBeTruthy();

    const login = await request(app).post("/api/auth/login").send({
      email: "dev@shipguard.io",
      password: "strong-password"
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});
