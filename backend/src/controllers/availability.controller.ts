import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { availabilityQuerySchema } from "../validators/availability.validator.js";
import { dateWithMin, minToHHMM, overlaps } from "../lib/time.js";

const SLOT_STEP_MIN = 15;

export async function getAvailability(req: Request, res: Response) {
  const parsed = availabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const { date, serviceId } = parsed.data;

  // 1) service süresini al
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return res.status(404).json({ message: "Service not found" });
  }

  // 2) günün haftanın kaçıncı günü olduğuna bak (0 pazar .. 6 cumartesi)
  const [y, mo, d] = date.split("-").map(Number);
  const dayOfWeek = new Date(y, mo - 1, d).getDay();

  // 3) o günün çalışma saatini al
  const wh = await prisma.workingHour.findFirst({ where: { dayOfWeek } });
  if (!wh) {
    return res.json({ date, serviceId, slots: [] }); // kapalı gün
  }

  // 4) o günün randevularını çek
  const dayStart = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, mo - 1, d, 23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      startAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startAt: true, endAt: true },
  });

  // 5) slotları hesapla
  const slots: string[] = [];

  for (let startMin = wh.startMin; startMin + service.durationMin <= wh.endMin; startMin += SLOT_STEP_MIN) {
    const candidateStart = dateWithMin(date, startMin);
    const candidateEnd = new Date(candidateStart.getTime() + service.durationMin * 60_000);

    // Çakışma var mı?
    const conflict = appointments.some((a) =>
      overlaps(candidateStart, candidateEnd, a.startAt, a.endAt)
    );

    if (!conflict) {
      slots.push(minToHHMM(startMin));
    }
  }

  return res.json({
    date,
    service: { id: service.id, name: service.name, durationMin: service.durationMin },
    workingHours: { dayOfWeek, startMin: wh.startMin, endMin: wh.endMin },
    slotStepMin: SLOT_STEP_MIN,
    slots,
  });
}
