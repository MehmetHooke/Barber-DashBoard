import { http } from "./http";

export type AdminAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
  note?: string | null;
  user: { id: string; name: string; email: string };
  service: { id: string; name: string; durationMin: number; price?: number | null };
};

export async function getAdminAppointments() {
  const res = await http.get<{ appointments: AdminAppointment[] }>("/appointments");
  return res.data.appointments;
}

export async function updateAppointmentStatus(id: string, status: "CONFIRMED" | "CANCELLED" | "DONE") {
  const res = await http.patch(`/appointments/${id}/status`, { status });
  return res.data.appointment;
}
