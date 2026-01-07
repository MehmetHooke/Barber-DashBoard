import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createAppointment,
  listMyAppointments,
  cancelMyAppointment,
  listAppointmentsAdmin,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";

const router = Router();

// user
router.post("/", requireAuth, createAppointment);
router.get("/my", requireAuth, listMyAppointments);
router.delete("/:id", requireAuth, cancelMyAppointment);

// barber admin
router.get("/", requireAuth, requireRole("BARBER"), listAppointmentsAdmin);
router.patch("/:id/status", requireAuth, requireRole("BARBER"), updateAppointmentStatus);

export default router;
