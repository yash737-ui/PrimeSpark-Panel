// PowerSpark Panel - Shared Auth Types
// Mirrors the Prisma Role enum without either app importing @prisma/client
// directly across the workspace boundary.

export type Role = "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
}

export interface AuthSuccessData {
  user: AuthUser;
  accessToken: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}
