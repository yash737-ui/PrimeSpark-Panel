import crypto from "node:crypto";
import type { Request } from "express";
import type { AuthUser, LoginInput, RegisterInput, Role } from "@powerspark/types";
import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../lib/password";
import { generateRawToken, hashToken } from "../../lib/tokens";
import { REFRESH_TOKEN_TTL_DAYS, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { AuditAction, recordAuditLog } from "../../lib/audit";

const EMAIL_VERIFICATION_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_MINUTES = 30;

export class AuthError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
}

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

async function issueTokenPair(user: UserRecord, req?: Request) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
      createdByIp: req?.ip ?? null,
    },
  });

  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput, req?: Request) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError(409, "An account with this email already exists");
  }

  const password = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, password, name: input.name },
  });

  // Email verification structure only: a token is generated and stored
  // (hashed) so the verify-email flow works end-to-end. No email is
  // actually sent yet - that requires an email provider, added later.
  const rawVerificationToken = generateRawToken();
  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashToken(rawVerificationToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000),
    },
  });

  await recordAuditLog({ userId: user.id, action: AuditAction.REGISTER, req });
  await recordAuditLog({ userId: user.id, action: AuditAction.EMAIL_VERIFICATION_SENT, req });

  const tokens = await issueTokenPair(user, req);

  return {
    user: toAuthUser(user),
    ...tokens,
    // Only surfaced outside production, since there is no email transport
    // yet to deliver it any other way. Remove once email sending exists.
    devEmailVerificationToken: process.env.NODE_ENV === "production" ? undefined : rawVerificationToken,
  };
}

export async function loginUser(input: LoginInput, req?: Request) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await recordAuditLog({
      action: AuditAction.LOGIN_FAILURE,
      req,
      metadata: { email: input.email, reason: "no_such_user" },
    });
    throw new AuthError(401, "Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, user.password);
  if (!passwordMatches) {
    await recordAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN_FAILURE,
      req,
      metadata: { reason: "bad_password" },
    });
    throw new AuthError(401, "Invalid email or password");
  }

  await recordAuditLog({ userId: user.id, action: AuditAction.LOGIN_SUCCESS, req });

  const tokens = await issueTokenPair(user, req);
  return { user: toAuthUser(user), ...tokens };
}

export async function logoutUser(refreshToken: string | undefined, req?: Request) {
  if (!refreshToken) return;

  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
  if (record && !record.revokedAt) {
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    await recordAuditLog({ userId: record.userId, action: AuditAction.LOGOUT, req });
  }
}

export async function refreshTokens(refreshToken: string | undefined, req?: Request) {
  if (!refreshToken) {
    throw new AuthError(401, "Refresh token required");
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError(401, "Invalid or expired refresh token");
  }

  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new AuthError(401, "Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) {
    throw new AuthError(401, "User no longer exists");
  }

  // Rotate: the presented refresh token is revoked and a brand new pair
  // is issued, so a stolen-but-already-used refresh token cannot be reused.
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });

  const tokens = await issueTokenPair(user, req);
  await recordAuditLog({ userId: user.id, action: AuditAction.TOKEN_REFRESH, req });

  return { user: toAuthUser(user), ...tokens };
}

export async function requestPasswordReset(email: string, req?: Request) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately respond the same way whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (!user) {
    return { devResetToken: undefined as string | undefined };
  }

  const rawToken = generateRawToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
    },
  });

  await recordAuditLog({ userId: user.id, action: AuditAction.PASSWORD_RESET_REQUESTED, req });

  return {
    devResetToken: process.env.NODE_ENV === "production" ? undefined : rawToken,
  };
}

export async function resetPassword(token: string, newPassword: string, req?: Request) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AuthError(400, "This password reset link is invalid or has expired");
  }

  const password = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Resetting a password invalidates every existing session.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await recordAuditLog({ userId: record.userId, action: AuditAction.PASSWORD_RESET_SUCCESS, req });
}

export async function verifyEmail(token: string, req?: Request) {
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AuthError(400, "This verification link is invalid or has expired");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  await recordAuditLog({ userId: record.userId, action: AuditAction.EMAIL_VERIFIED, req });
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAuthUser(user) : null;
}
