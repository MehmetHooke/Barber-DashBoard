import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/service.validator.js";

export async function listServices(_req: Request, res: Response) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ services });
}

export async function createService(req: Request, res: Response) {
  const parsed = createServiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const service = await prisma.service.create({ data: parsed.data });
  res.status(201).json({ service });
}

export async function updateService(req: Request, res: Response) {
  const { id } = req.params;

  const parsed = updateServiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const service = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });

  res.json({ service });
}
