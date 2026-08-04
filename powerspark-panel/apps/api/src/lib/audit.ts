import type { Request } from "express";
import { prisma } from "./prisma";

// PowerSpark Panel - Audit Logging
// Append-only trail of security-relevant auth events. Failures here are
// swallowed (logged to console) rather than thrown, so a logging problem
// never breaks the actual auth flow the user is waiting on.

export const AuditAction = {
  REGISTER: "auth.register",
  LOGIN_SUCCESS: "auth.login_success",
  LOGIN_FAILURE: "auth.login_failure",
  LOGOUT: "auth.logout",
  TOKEN_REFRESH: "auth.token_refresh",
  PASSWORD_RESET_REQUESTED: "auth.password_reset_requested",
  PASSWORD_RESET_SUCCESS: "auth.password_reset_success",
  EMAIL_VERIFICATION_SENT: "auth.email_verification_sent",
  EMAIL_VERIFIED: "auth.email_verified",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

interface RecordAuditLogParams {
  userId?: string | null;
  action: AuditActionType;
  req?: Request;
  metadata?: Record<string, unknown>;
}

export async function recordAuditLog({ userId, action, req, metadata }: RecordAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        ipAddress: req?.ip ?? null,
        userAgent: req?.headers["user-agent"] ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log:", error);
  }
}
