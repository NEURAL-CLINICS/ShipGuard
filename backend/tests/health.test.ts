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

describe("health", () => {
  it("returns ok", async () => {
    const response = await api.get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
