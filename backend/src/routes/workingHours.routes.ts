import { Router } from "express";
import { getWorkingHours, setWorkingHours } from "../controllers/workingHours.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// public: herkes görebilir (müşteri slot hesabı için lazım)
router.get("/", getWorkingHours);

// barber only: set eder
router.put("/", requireAuth, requireRole("BARBER"), setWorkingHours);

export default router;
