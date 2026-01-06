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

describe("health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
