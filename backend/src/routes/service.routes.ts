import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listServices,
  createService,
  updateService,
} from "../controllers/service.controller.js";

const router = Router();

// public
router.get("/", listServices);

// barber only
router.post("/", requireAuth, requireRole("BARBER"), createService);
router.patch("/:id", requireAuth, requireRole("BARBER"), updateService);

export default router;
