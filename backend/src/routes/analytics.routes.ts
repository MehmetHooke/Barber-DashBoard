import { Router } from "express";
import { analyticsSummary } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.get("/summary", requireAuth, requireRole("BARBER"), analyticsSummary);

export default router;
