import { http } from "./http";

export type AvailabilityResponse = {
  date: string;
  service: { id: string; name: string; durationMin: number };
  slotStepMin: number;
  slots: string[];
};

export async function getAvailability(date: string, serviceId: string) {
  const res = await http.get<AvailabilityResponse>("/availability", {
    params: { date, serviceId },
  });
  return res.data;
}
