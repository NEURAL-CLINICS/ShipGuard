import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../errors";
import { requireAuth } from "../middleware/auth";
import { createToken, hashPassword, verifyPassword } from "../services/auth";
import { userStore } from "../storage";
import type { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = registerSchema.parse(req.body);
    const existing = await userStore.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }
    const passwordHash = await hashPassword(password);
    const user = await userStore.create(email, passwordHash);
    const token = createToken({ id: user.id, email: user.email });
    res.status(201).json({ user: { id: user.id, email: user.email }, token });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await userStore.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Invalid credentials");
    }
    const token = createToken({ id: user.id, email: user.email });
    res.json({ user: { id: user.id, email: user.email }, token });
  })
);

router.get("/me", requireAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  res.json({ user });
});

const forgotSchema = z.object({
  email: z.string().email()
});

router.post(
  "/forgot",
  asyncHandler(async (req, res) => {
    forgotSchema.parse(req.body);
    res.status(202).json({ status: "reset-requested" });
  })
);

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

router.post(
  "/reset",
  asyncHandler(async (req, res) => {
    resetSchema.parse(req.body);
    res.status(202).json({ status: "reset-accepted" });
  })
);

export default router;
