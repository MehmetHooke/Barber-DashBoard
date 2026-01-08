import { http } from "./http";

export type WorkingHour = {
  id: string;
  dayOfWeek: number; // 0..6
  startMin: number;  // 0..1440
  endMin: number;    // 0..1440
};

export async function getWorkingHours() {
  const res = await http.get<{ hours: WorkingHour[] }>("/working-hours");
  return res.data.hours;
}

export async function setWorkingHours(hours: Array<{ dayOfWeek: number; startMin: number; endMin: number }>) {
  const res = await http.put<{ hours: WorkingHour[] }>("/working-hours", { hours });
  return res.data.hours;
}
