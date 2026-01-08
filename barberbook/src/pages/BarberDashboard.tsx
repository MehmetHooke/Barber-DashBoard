import { useEffect, useState } from "react";
import { getWorkingHours, setWorkingHours } from "../api/workingHours";
import { getServices, type Service } from "../api/services";
import { createServiceAdmin, updateServiceAdmin } from "../api/adminServices";
import { getAdminAppointments, updateAppointmentStatus, type AdminAppointment } from "../api/adminAppointments";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minToHHMM(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function hhmmToMin(v: string) {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}
function fmtDT(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function BarberDashboard() {
  const [tab, setTab] = useState<"hours" | "services" | "appointments">("hours");
  const [error, setError] = useState<string | null>(null);

  // hours
  const [hours, setHours] = useState<Record<number, { enabled: boolean; start: string; end: string }>>(() => {
    const init: any = {};
    for (let d = 0; d < 7; d++) init[d] = { enabled: false, start: "09:00", end: "18:00" };
    return init;
  });
  const [savingHours, setSavingHours] = useState(false);

  // services
  const [services, setServicesState] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [newService, setNewService] = useState({ name: "", durationMin: 30, price: 0 });
  const [creatingService, setCreatingService] = useState(false);

  // appointments
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loadingAppt, setLoadingAppt] = useState(false);
  const [busyApptId, setBusyApptId] = useState<string | null>(null);

  async function loadHours() {
    setError(null);
    const list = await getWorkingHours();
    // UI state'e map et
    const next: any = {};
    for (let d = 0; d < 7; d++) next[d] = { enabled: false, start: "09:00", end: "18:00" };

    list.forEach((h) => {
      next[h.dayOfWeek] = {
        enabled: true,
        start: minToHHMM(h.startMin),
        end: minToHHMM(h.endMin),
      };
    });

    setHours(next);
  }

  async function loadServices() {
    setLoadingServices(true);
    setError(null);
    try {
      const list = await getServices();
      setServicesState(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Services yüklenemedi.");
    } finally {
      setLoadingServices(false);
    }
  }

  async function loadAppointments() {
    setLoadingAppt(true);
    setError(null);
    try {
      const list = await getAdminAppointments();
      setAppointments(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Randevular yüklenemedi.");
    } finally {
      setLoadingAppt(false);
    }
  }

  useEffect(() => {
    // ilk açılış
    loadHours().catch(() => setError("Working hours yüklenemedi."));
    loadServices();
    loadAppointments();
  }, []);

  async function handleSaveHours() {
    setSavingHours(true);
    setError(null);
    try {
      const payload = Object.entries(hours)
        .filter(([_, v]) => v.enabled)
        .map(([day, v]) => ({
          dayOfWeek: Number(day),
          startMin: hhmmToMin(v.start),
          endMin: hhmmToMin(v.end),
        }));

      await setWorkingHours(payload);
      await loadHours();
      alert("Working hours saved");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Kaydedilemedi.");
    } finally {
      setSavingHours(false);
    }
  }

  async function handleCreateService() {
    if (!newService.name.trim()) return;

    setCreatingService(true);
    setError(null);
    try {
      await createServiceAdmin({
        name: newService.name.trim(),
        durationMin: Number(newService.durationMin),
        price: Number(newService.price),
      });
      setNewService({ name: "", durationMin: 30, price: 0 });
      await loadServices();
      alert("Service created");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Service oluşturulamadı.");
    } finally {
      setCreatingService(false);
    }
  }

  async function toggleServiceActive(s: Service) {
    setError(null);
    try {
      await updateServiceAdmin(s.id, { isActive: !s.isActive });
      await loadServices();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Güncellenemedi.");
    }
  }

  async function changeAppointmentStatus(id: string, status: "CONFIRMED" | "CANCELLED" | "DONE") {
    setBusyApptId(id);
    setError(null);
    try {
      await updateAppointmentStatus(id, status);
      await loadAppointments();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Status güncellenemedi.");
    } finally {
      setBusyApptId(null);
    }
  }

  const tabButton = (key: typeof tab, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={[
        "rounded-lg px-3 py-2 text-sm",
        tab === key ? "bg-black text-white" : "border hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Barber Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Working hours • Services • Appointments</p>
          </div>

          <div className="flex gap-2">
            {tabButton("hours", "Working Hours")}
            {tabButton("services", "Services")}
            {tabButton("appointments", "Appointments")}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* HOURS TAB */}
        {tab === "hours" && (
          <div className="mt-6">
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, d) => {
                const v = hours[d];
                return (
                  <div key={d} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={v.enabled}
                        onChange={(e) =>
                          setHours((prev) => ({
                            ...prev,
                            [d]: { ...prev[d], enabled: e.target.checked },
                          }))
                        }
                      />
                      <span className="w-12 text-sm font-medium">{dayNames[d]}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={v.start}
                        disabled={!v.enabled}
                        onChange={(e) =>
                          setHours((prev) => ({
                            ...prev,
                            [d]: { ...prev[d], start: e.target.value },
                          }))
                        }
                        className="rounded-lg border p-2 text-sm disabled:opacity-40"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <input
                        type="time"
                        value={v.end}
                        disabled={!v.enabled}
                        onChange={(e) =>
                          setHours((prev) => ({
                            ...prev,
                            [d]: { ...prev[d], end: e.target.value },
                          }))
                        }
                        className="rounded-lg border p-2 text-sm disabled:opacity-40"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveHours}
                disabled={savingHours}
                className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
              >
                {savingHours ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {tab === "services" && (
          <div className="mt-6">
            <div className="rounded-xl border p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-lg border p-2 text-sm"
                  placeholder="Service name"
                  value={newService.name}
                  onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  className="rounded-lg border p-2 text-sm"
                  type="number"
                  min={10}
                  max={240}
                  value={newService.durationMin}
                  onChange={(e) => setNewService((p) => ({ ...p, durationMin: Number(e.target.value) }))}
                />
                <input
                  className="rounded-lg border p-2 text-sm"
                  type="number"
                  min={0}
                  value={newService.price}
                  onChange={(e) => setNewService((p) => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCreateService}
                  disabled={creatingService}
                  className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
                >
                  {creatingService ? "Creating..." : "Create Service"}
                </button>
              </div>
            </div>

            <div className="mt-4">
              {loadingServices && <p className="text-sm text-gray-600">Loading...</p>}
              {!loadingServices && (
                <div className="space-y-3">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border p-4">
                      <div>
                        <div className="font-medium">
                          {s.name}{" "}
                          <span className="text-sm text-gray-500">({s.durationMin} dk)</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {s.price != null ? `₺${s.price}` : "No price"} •{" "}
                          {s.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleServiceActive(s)}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {tab === "appointments" && (
          <div className="mt-6">
            {loadingAppt && <p className="text-sm text-gray-600">Loading...</p>}

            {!loadingAppt && appointments.length === 0 && (
              <p className="text-sm text-gray-600">No appointments yet.</p>
            )}

            {!loadingAppt && appointments.length > 0 && (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {a.service.name} • {a.user.name}{" "}
                          <span className="text-sm text-gray-500">({a.user.email})</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {fmtDT(a.startAt)} → {fmtDT(a.endAt)} • {a.status}
                        </div>
                        {a.note && (
                          <div className="mt-2 text-sm text-gray-700">Not: {a.note}</div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={busyApptId === a.id}
                          onClick={() => changeAppointmentStatus(a.id, "CONFIRMED")}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
                        >
                          Confirm
                        </button>
                        <button
                          disabled={busyApptId === a.id}
                          onClick={() => changeAppointmentStatus(a.id, "DONE")}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
                        >
                          Done
                        </button>
                        <button
                          disabled={busyApptId === a.id}
                          onClick={() => changeAppointmentStatus(a.id, "CANCELLED")}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
