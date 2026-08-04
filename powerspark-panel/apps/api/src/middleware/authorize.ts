import type { NextFunction, Request, Response } from "express";
import type { Role } from "@powerspark/types";

/**
 * Role-Based Access Control. Use after `authenticate` on any route that
 * should be restricted to specific roles, e.g.:
 *
 *   router.get("/admin/stats", authenticate, authorize("ADMIN"), handler)
 *
 * No routes are restricted yet in this step - this middleware is ready
 * for server-management and admin routes added in future steps.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: "error", message: "Insufficient permissions" });
    }

    next();
  };
}
