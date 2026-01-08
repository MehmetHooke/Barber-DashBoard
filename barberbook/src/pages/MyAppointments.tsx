import { useEffect, useState } from "react";
import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
} from "../api/appointments";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function statusBadge(status: Appointment["status"]) {
  const base = "rounded-full px-2 py-1 text-xs font-medium";
  if (status === "PENDING") return `${base} bg-yellow-100 text-yellow-800`;
  if (status === "CONFIRMED") return `${base} bg-blue-100 text-blue-800`;
  if (status === "DONE") return `${base} bg-green-100 text-green-800`;
  return `${base} bg-gray-100 text-gray-700`; // CANCELLED
}

export default function MyAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAppointments();
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Randevular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id: string) {
    const ok = confirm("Randevuyu iptal etmek istiyor musun?");
    if (!ok) return;

    setBusyId(id);
    setError(null);
    try {
      await cancelAppointment(id);

      // UI güncelleme: 1) tekrar fetch (en güvenlisi)
      await load();

      // Alternatif (daha hızlı): local state üzerinde status'u CANCELLED yap
      // setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "İptal edilemedi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Appointments</h1>
            <p className="mt-1 text-sm text-gray-600">
              Randevularını burada görür ve iptal edebilirsin.
            </p>
          </div>

          <button
            onClick={load}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && <p className="mt-6 text-sm text-gray-600">Loading...</p>}

        {!loading && items.length === 0 && (
          <p className="mt-6 text-sm text-gray-600">
            Henüz randevun yok. Book sayfasından oluşturabilirsin.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-6 space-y-3">
            {items.map((a) => {
              const canCancel = a.status !== "DONE" && a.status !== "CANCELLED";
              return (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{a.service.name}</div>
                      <span className={statusBadge(a.status)}>{a.status}</span>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {formatDateTime(a.startAt)} → {formatDateTime(a.endAt)}
                      <span className="mx-2">•</span>
                      {a.service.durationMin} dk
                      {a.service.price != null ? (
                        <>
                          <span className="mx-2">•</span> ₺{a.service.price}
                        </>
                      ) : null}
                    </div>

                    {a.note && (
                      <div className="mt-2 text-sm text-gray-700">
                        Not: {a.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancel(a.id)}
                      disabled={!canCancel || busyId === a.id}
                      className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white disabled:opacity-40"
                    >
                      {busyId === a.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
