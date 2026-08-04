import crypto from "node:crypto";

/**
 * Generates a cryptographically random token to email to the user
 * (as part of a verification/reset link). Only the hash of this
 * value is ever persisted - the raw token is never stored.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * One-way hash for storing verification/reset tokens at rest, mirroring
 * how refresh tokens are stored. Using SHA-256 here (not bcrypt) is
 * intentional: these tokens are already high-entropy random values, not
 * user-chosen passwords, so a fast deterministic hash is appropriate and
 * lets us look the token up by its hash in a single indexed query.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
