import { http } from "./http";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  price?: number | null;
  isActive: boolean; 
};

export async function getServices() {
  const res = await http.get<{ services: Service[] }>("/services");
  return res.data.services;
}
