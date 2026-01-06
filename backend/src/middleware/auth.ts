import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";
import { verifyToken } from "../services/auth";
import type { AuthRequest } from "../types";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header) {
    return next(new HttpError(401, "Missing Authorization header"));
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Invalid Authorization header"));
  }
  const user = verifyToken(token);
  (req as AuthRequest).user = user;
  return next();
}
