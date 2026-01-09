import { useEffect, useMemo, useState } from "react";
import { getServices, type Service } from "../api/services";
import { getAvailability } from "../api/availability";
import { createAppointment } from "../api/appointments";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Book() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [note, setNote] = useState<string>("");

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

  // services yükle
  useEffect(() => {
    async function load() {
      setLoadingServices(true);
      setError(null);
      try {
        const data = await getServices();
        setServices(data);
        if (data[0]) setServiceId(data[0].id);
      } catch {
        setError("Services yüklenemedi.");
      } finally {
        setLoadingServices(false);
      }
    }
    load();
  }, []);

  // slots yükle
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
        note: note.trim() ? note.trim() : undefined,
      });

      // slot listesi güncellensin
      const data = await getAvailability(date, serviceId);
      setSlots(data.slots);
      setSelectedSlot("");
      setNote("");

      // şimdilik basit
      alert("Randevu oluşturuldu!");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Randevu oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  const canConfirm = !!serviceId && !!date && !!selectedSlot && !creating;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Randevu Al</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hizmet seç, tarih belirle, boş saatlerden birini al.
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left: form */}
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>Servis, tarih ve not (opsiyonel).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Hizmet</Label>
              {loadingServices ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} • {s.durationMin} dk{s.price != null ? ` • ₺${s.price}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Note (opsiyonel)</Label>
              <Textarea
                placeholder="Örn: kısa kesim, sakal şekillendirme…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground">
                {note.length}/300
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Seçili Hizmet</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedService ? selectedService.name : "—"}
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedService && (
                    <Badge variant="secondary">{selectedService.durationMin} dk</Badge>
                  )}
                  {selectedSlot && <Badge>{selectedSlot}</Badge>}
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                disabled={!canConfirm}
                onClick={handleCreate}
              >
                {creating ? "Oluşturuluyor..." : "Randevuyu Onayla"}
              </Button>

              {!selectedSlot && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Randevuyu tamamlamak için bir saat seç.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: slots */}
        <Card>
          <CardHeader>
            <CardTitle>Uygun Zaman Dilimleri</CardTitle>
            <CardDescription>
              {date ? "Boş saatleri seç." : "Randevu saatlerini görmek için tarih seç."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!date && (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Tarih seçildiğinde slotlar burada görünecek.
              </div>
            )}

            {date && loadingSlots && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}

            {date && !loadingSlots && slots.length === 0 && (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                Bu gün için boş slot yok.
              </div>
            )}

            {date && !loadingSlots && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {slots.map((t) => {
                  const active = t === selectedSlot;
                  return (
                    <Button
                      key={t}
                      type="button"
                      variant={active ? "default" : "outline"}
                      onClick={() => setSelectedSlot(t)}
                      className="w-full"
                    >
                      {t}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
