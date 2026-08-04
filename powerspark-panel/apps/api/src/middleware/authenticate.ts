import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

const AUTH_HEADER_PREFIX = "Bearer ";

/**
 * Requires a valid access token in the Authorization header
 * (`Authorization: Bearer <token>`) and attaches the decoded
 * identity to req.user for downstream handlers/middleware.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(AUTH_HEADER_PREFIX)) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const token = header.slice(AUTH_HEADER_PREFIX.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired access token" });
  }
}
