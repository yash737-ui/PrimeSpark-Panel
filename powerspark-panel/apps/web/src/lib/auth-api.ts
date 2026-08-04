import type {
  ApiSuccessResponse,
  AuthSuccessData,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@powerspark/types";
import { apiFetch } from "./api-client";

interface MessageData {
  message: string;
}

export function registerRequest(input: RegisterInput) {
  return apiFetch<ApiSuccessResponse<AuthSuccessData>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginRequest(input: LoginInput) {
  return apiFetch<ApiSuccessResponse<AuthSuccessData>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutRequest() {
  return apiFetch<ApiSuccessResponse<MessageData>>("/api/auth/logout", { method: "POST" });
}

export function forgotPasswordRequest(input: ForgotPasswordInput) {
  return apiFetch<ApiSuccessResponse<MessageData>>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPasswordRequest(input: ResetPasswordInput) {
  return apiFetch<ApiSuccessResponse<MessageData>>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyEmailRequest(input: VerifyEmailInput) {
  return apiFetch<ApiSuccessResponse<MessageData>>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
