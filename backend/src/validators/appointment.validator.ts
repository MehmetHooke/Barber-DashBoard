import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be HH:MM"),
  note: z.string().max(300).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "DONE"]),
});
