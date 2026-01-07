import { Router } from "express";
import { getAvailability } from "../controllers/availability.controller.js";

const router = Router();

// public: müşteri login olmadan da slot görebilir (istersen sonra auth zorunlu yaparız)
router.get("/", getAvailability);

export default router;
