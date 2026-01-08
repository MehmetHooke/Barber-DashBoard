import { http } from "./http";
import type { Service } from "./services";

export async function createServiceAdmin(input: { name: string; durationMin: number; price?: number }) {
  const res = await http.post<{ service: Service }>("/services", input);
  return res.data.service;
}

export async function updateServiceAdmin(id: string, input: Partial<{ name: string; durationMin: number; price: number; isActive: boolean }>) {
  const res = await http.patch<{ service: Service }>(`/services/${id}`, input);
  return res.data.service;
}
