import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import { signToken } from "../lib/jwt.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export async function register(req: Request, res: Response) {
  // 1) body validate
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const { name, email, password } = parsed.data;

  // 2) email unique mi?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  // 3) password'u hashle
  const passwordHash = await hashPassword(password);

  // 4) kullanıcıyı DB'ye kaydet
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // 5) token üret ve dön
  const token = signToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token });
}

export async function login(req: Request, res: Response) {
  // 1) body validate
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const { email, password } = parsed.data;

  // 2) kullanıcı var mı?
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // 3) şifre doğru mu?
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  // 4) token üret ve dön
  const token = signToken({ sub: user.id, role: user.role });
  return res.json({ token });
}

