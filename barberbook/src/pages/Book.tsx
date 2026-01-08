import { useEffect, useMemo, useState } from "react";
import { getServices, type Service } from "../api/services";
import { getAvailability } from "../api/availability";
import { createAppointment } from "../api/appointments";

export default function Book() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  // 1) services yükle
  useEffect(() => {
    async function load() {
      setLoadingServices(true);
      setError(null);
      try {
        const data = await getServices();
        setServices(data);
        if (data[0]) setServiceId(data[0].id); // default seç
      } catch {
        setError("Services yüklenemedi.");
      } finally {
        setLoadingServices(false);
      }
    }
    load();
  }, []);

  // 2) service veya date değişince slots çek
  useEffect(() => {
    async function loadSlots() {
      setSlots([]);
      setSelectedSlot("");
      setError(null);

      if (!serviceId || !date) return;

      setLoadingSlots(true);
      try {
        const data = await getAvailability(date, serviceId);
        setSlots(data.slots);
      } catch (e: any) {
        // backend 400/404 vs gelebilir
        setError(e?.response?.data?.message ?? "Slots yüklenemedi.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [serviceId, date]);

  async function handleCreate() {
    if (!serviceId || !date || !selectedSlot) return;

    setCreating(true);
    setError(null);
    try {
      await createAppointment({
        serviceId,
        date,
        startTime: selectedSlot,
        note: "",
      });

      // randevu aldıktan sonra slots’u yenile (slot düşecek)
      const data = await getAvailability(date, serviceId);
      setSlots(data.slots);
      setSelectedSlot("");

      alert("Randevu oluşturuldu!");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Randevu oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Book Appointment</h1>
            <p className="mt-1 text-sm text-gray-600">
              Hizmet seç, tarih seç, boş saatlerden birini al.
            </p>
          </div>

          {selectedService && (
            <div className="rounded-xl border px-3 py-2 text-sm">
              <div className="font-medium">{selectedService.name}</div>
              <div className="text-gray-600">
                {selectedService.durationMin} dk
                {selectedService.price != null ? ` • ₺${selectedService.price}` : ""}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Service</label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={loadingServices}
            >
              {loadingServices && <option>Loading...</option>}
              {!loadingServices &&
                services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin} dk)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Slots */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Available slots</h2>
            {loadingSlots && <span className="text-sm text-gray-500">Loading…</span>}
          </div>

          {!date && (
            <p className="mt-3 text-sm text-gray-600">Önce bir tarih seç.</p>
          )}

          {date && !loadingSlots && slots.length === 0 && (
            <p className="mt-3 text-sm text-gray-600">Bu gün için boş slot yok.</p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((t) => {
              const active = t === selectedSlot;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedSlot(t)}
                  className={[
                    "rounded-lg border px-2 py-2 text-sm",
                    active ? "bg-black text-white" : "bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCreate}
            disabled={!serviceId || !date || !selectedSlot || creating}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
          >
            {creating ? "Creating..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
