import jwt from "jsonwebtoken";
import type { Role } from "@powerspark/types";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
export const REFRESH_TOKEN_TTL_DAYS = process.env.JWT_REFRESH_EXPIRES_IN_DAYS
  ? Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS)
  : 7;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload & jwt.JwtPayload;
}
