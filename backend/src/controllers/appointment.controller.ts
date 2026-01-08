import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createAppointmentSchema, updateStatusSchema } from "../validators/appointment.validator.js";
import { dateWithMin, hhmmToMin, overlaps } from "../lib/time.js";
import type { AuthRequest } from "../middleware/requireAuth.js";

export async function createAppointment(req: AuthRequest, res: Response) {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const userId = req.user!.id; // requireAuth ile garanti
  const { serviceId, date, startTime, note } = parsed.data;

  // 1) service var mı?
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return res.status(404).json({ message: "Service not found" });
  }

  // 2) working hours uygun mu?
  const [y, mo, d] = date.split("-").map(Number);
  const dayOfWeek = new Date(y, mo - 1, d).getDay();
  const wh = await prisma.workingHour.findFirst({ where: { dayOfWeek } });
  if (!wh) return res.status(400).json({ message: "Barber is closed this day" });

  const startMin = hhmmToMin(startTime);
  const endMin = startMin + service.durationMin;

  if (startMin < wh.startMin || endMin > wh.endMin) {
    return res.status(400).json({ message: "Selected time is outside working hours" });
  }

  // 3) candidateStart/End oluştur
  const candidateStart = dateWithMin(date, startMin);
  const candidateEnd = new Date(candidateStart.getTime() + service.durationMin * 60_000);

  // 4) O günün randevularını çek ve çakışma kontrolü yap
  const dayStart = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, mo - 1, d, 23, 59, 59, 999);

  const existing = await prisma.appointment.findMany({
    where: {
      startAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startAt: true, endAt: true },
  });

  const conflict = existing.some((a) =>
    overlaps(candidateStart, candidateEnd, a.startAt, a.endAt)
  );

  if (conflict) {
    return res.status(409).json({ message: "Time slot is not available" });
  }

  // 5) oluştur
  const appointment = await prisma.appointment.create({
    data: {
      userId,
      serviceId,
      startAt: candidateStart,
      endAt: candidateEnd,
      status: "PENDING",
      note,
      priceSnapshot: service.price ?? null,
    },
    include: {
      service: { select: { id: true, name: true, durationMin: true, price: true } },
    },
  });

  return res.status(201).json({ appointment });
}

export async function listMyAppointments(req: AuthRequest, res: Response) {
  const userId = req.user!.id;

  const items = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startAt: "asc" },
    include: { service: { select: { name: true, durationMin: true, price: true } } },
  });

  return res.json({ appointments: items });
}

export async function cancelMyAppointment(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return res.status(404).json({ message: "Appointment not found" });
  if (appt.userId !== userId) return res.status(403).json({ message: "Forbidden" });

  // v1 kuralı: DONE randevu iptal edilemez
  if (appt.status === "DONE") {
    return res.status(400).json({ message: "Cannot cancel a completed appointment" });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return res.json({ appointment: updated });
}

// ---- BARBER SIDE ----

export async function listAppointmentsAdmin(req: AuthRequest, res: Response) {
  // basit v1: query paramları sonra ekleriz
  const items = await prisma.appointment.findMany({
    orderBy: { startAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, durationMin: true, price: true } },
    },
  });

  return res.json({ appointments: items });
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return res.json({ appointment: updated });
}
