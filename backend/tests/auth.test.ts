import type { Express } from "express";
import type { Server } from "http";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../src/storage";
import { startTestServer, stopTestServer } from "./testServer";

let app: Express;
let server: Server;
let api: request.SuperTest<request.Test>;

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

describe("auth", () => {
  it("registers and logs in", async () => {
    const register = await api.post("/api/auth/register").send({
      email: "dev@shipguard.io",
      password: "strong-password"
    });
    expect(register.status).toBe(201);
    expect(register.body.token).toBeTruthy();

    const login = await api.post("/api/auth/login").send({
      email: "dev@shipguard.io",
      password: "strong-password"
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});
