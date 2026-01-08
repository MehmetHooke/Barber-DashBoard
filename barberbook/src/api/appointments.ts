import { http } from "./http";

export type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
  note?: string | null;
  service: { name: string; durationMin: number; price?: number | null };
};

export async function createAppointment(input: {
  serviceId: string;
  date: string;
  startTime: string;
  note?: string;
}) {
  const res = await http.post("/appointments", input);
  return res.data.appointment;
}

export async function getMyAppointments() {
  const res = await http.get<{ appointments: Appointment[] }>("/appointments/my");
  return res.data.appointments;
}

export async function cancelAppointment(id: string) {
  const res = await http.delete(`/appointments/${id}`);
  return res.data.appointment;
}
