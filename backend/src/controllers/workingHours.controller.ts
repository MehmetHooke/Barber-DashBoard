import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { setWorkingHoursSchema } from "../validators/workingHours.validator.js";

export async function getWorkingHours(_req: Request, res: Response) {
  const hours = await prisma.workingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  res.json({ hours });
}

/**
 * Berber haftalık çalışma saatlerini "set" eder.
 * Basit v1: gönderilen listeyi DB'de tamamen yeniler.
 */
export async function setWorkingHours(req: Request, res: Response) {
  const parsed = setWorkingHoursSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const hours = parsed.data.hours;

  // basit doğrulama: start < end
  for (const h of hours) {
    if (h.startMin >= h.endMin) {
      return res.status(400).json({
        message: `Invalid range for dayOfWeek=${h.dayOfWeek}. startMin must be < endMin.`,
      });
    }
  }

  // aynı dayOfWeek iki kere gelmesin
  const seen = new Set<number>();
  for (const h of hours) {
    if (seen.has(h.dayOfWeek)) {
      return res.status(400).json({
        message: `Duplicate dayOfWeek=${h.dayOfWeek}`,
      });
    }
    seen.add(h.dayOfWeek);
  }

  // "set" mantığı: önce sil, sonra ekle (transaction)
  await prisma.$transaction(async (tx) => {
    await tx.workingHour.deleteMany({});
    if (hours.length) {
      await tx.workingHour.createMany({ data: hours });
    }
  });

  const saved = await prisma.workingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  res.json({ hours: saved });
}
