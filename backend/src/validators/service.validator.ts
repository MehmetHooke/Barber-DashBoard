import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2),
  durationMin: z.number().int().min(10).max(240),
  price: z.number().int().min(0).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  durationMin: z.number().int().min(10).max(240).optional(),
  price: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
