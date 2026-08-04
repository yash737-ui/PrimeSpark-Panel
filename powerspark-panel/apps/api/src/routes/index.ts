import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.use("/auth", authRoutes);

// Future feature routers (server management, files, billing, etc.)
// will be mounted here in later steps.

export default router;
