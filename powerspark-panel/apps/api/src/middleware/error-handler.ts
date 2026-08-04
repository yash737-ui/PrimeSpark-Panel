import type { NextFunction, Request, Response } from "express";
import { AuthError } from "../modules/auth/auth.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ status: "error", message: "Internal server error" });
}
