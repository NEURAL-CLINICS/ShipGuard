import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: "Validation failed", details: err.flatten() }
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { message: err.message, details: err.details }
    });
  }
  console.error("Unhandled error", err);
  return res.status(500).json({ error: { message: "Internal server error" } });
}
