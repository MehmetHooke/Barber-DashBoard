import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name too short"),
   surname: z.string().min(1),
  phoneNumber: z.string().min(10).max(20),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
