import type { NextFunction, Request, Response } from "express";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@powerspark/types";
import * as authService from "./auth.service";
import { REFRESH_TOKEN_TTL_DAYS } from "../../lib/jwt";

const REFRESH_COOKIE_NAME = "powerspark_refresh_token";
const REFRESH_COOKIE_PATH = "/api/auth";

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req: Request<unknown, unknown, RegisterInput>, res: Response, next: NextFunction) {
  try {
    const { refreshToken, devEmailVerificationToken, ...rest } = await authService.registerUser(req.body, req);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ status: "success", data: rest, devEmailVerificationToken });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request<unknown, unknown, LoginInput>, res: Response, next: NextFunction) {
  try {
    const { refreshToken, ...rest } = await authService.loginUser(req.body, req);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ status: "success", data: rest });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logoutUser(refreshToken, req);
    clearRefreshCookie(res);
    res.status(200).json({ status: "success", data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const { refreshToken: newRefreshToken, ...rest } = await authService.refreshTokens(refreshToken, req);
    setRefreshCookie(res, newRefreshToken);
    res.status(200).json({ status: "success", data: rest });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request<unknown, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { devResetToken } = await authService.requestPasswordReset(req.body.email, req);
    res.status(200).json({
      status: "success",
      data: { message: "If that email is registered, a reset link has been sent." },
      devResetToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request<unknown, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.resetPassword(req.body.token, req.body.password, req);
    res.status(200).json({ status: "success", data: { message: "Password has been reset" } });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailHandler(
  req: Request<unknown, unknown, VerifyEmailInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.verifyEmail(req.body.token, req);
    res.status(200).json({ status: "success", data: { message: "Email verified" } });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user ? await authService.getUserById(req.user.id) : null;
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
}
