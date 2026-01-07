import { z } from "zod";

export const workingHourItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0=Pazar ... 6=Cumartesi
  startMin: z.number().int().min(0).max(1440),
  endMin: z.number().int().min(0).max(1440),
});

export const setWorkingHoursSchema = z.object({
  hours: z.array(workingHourItemSchema).max(7),
});
