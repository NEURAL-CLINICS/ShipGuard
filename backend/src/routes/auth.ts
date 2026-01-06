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
    const existing = userStore.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }
    const passwordHash = await hashPassword(password);
    const user = userStore.create(email, passwordHash);
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
    const user = userStore.findByEmail(email);
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

export default router;
