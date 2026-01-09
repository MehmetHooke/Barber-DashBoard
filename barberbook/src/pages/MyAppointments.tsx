import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
} from "../api/appointments";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";


function formatDateTimeTR(iso: string) {
  const d = new Date(iso);

  // "9 Ocak 2026" kısmı
  const datePart = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
  }).format(d);

  // "Cuma" kısmı
  const dayPart = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
  }).format(d);

  // weekday "cuma" gelirse baş harf büyütmek için:
  const dayCap = dayPart.charAt(0).toUpperCase() + dayPart.slice(1);

  return `${datePart} ${dayCap}`;
}


function formatTimeHour(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}.${mi}`;
}

function statusVariant(status: Appointment["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PENDING") return "secondary";
  if (status === "CONFIRMED") return "default";
  if (status === "DONE") return "outline";
  return "destructive"; // CANCELLED
}

export default function MyAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);


  const upcoming = useMemo(
    () => items.filter((a) => a.status !== "CANCELLED" && a.status !== "DONE"),
    [items]
  );
  const history = useMemo(
    () => items.filter((a) => a.status === "CANCELLED" || a.status === "DONE"),
    [items]
  );

  function statusBadge(status: Appointment["status"]) {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="border-none" variant="default">Onaylandı</Badge>;
      case "PENDING":
        return <Badge className="border-none" variant="secondary">Beklemede</Badge>;
      case "CANCELLED":
        return <Badge className="bg-transparent  border-none " >İptal</Badge>;
      case "DONE":
        return <Badge className="border-none" variant="outline">Tamamlandı</Badge>;
      default:
        return <Badge className="border-none" variant="secondary">Durum</Badge>;
    }
  }

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
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "İptal edilemedi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Randevularım</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Randevularını gör, iptal et ve geçmişi takip et.
          </p>
        </div>

        <Button variant="outline" onClick={load} disabled={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Randevunuz yok !</CardTitle>
            <CardDescription>
              Henüz randevun yok. Book sayfasından randevu oluşturabilirsin.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Content */}
      {!loading && items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle>Gelecek randevular</CardTitle>
              <CardDescription>İptal edilmemiş ve tamamlanmamış randevular.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  Yaklaşan randevu yok.
                </div>
              )}

              {upcoming.map((a) => {
                const canCancel = a.status !== "DONE" && a.status !== "CANCELLED";
                return (
                  <div key={a.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{a.service.name}</div>
                          <Badge variant={statusVariant(a.status)}>{statusBadge(a.status)}</Badge>
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground">
                          {formatDateTimeTR(a.startAt)}
                          <span className="mx-2">•</span>
                          {formatTimeHour(a.startAt)} → {formatTimeHour(a.endAt)}
                          <span className="mx-2">•</span>
                          {a.service.durationMin} dk
                          {a.service.price != null ? (
                            <>
                              <span className="mx-2">•</span> ₺{a.service.price}
                            </>
                          ) : null}
                        </div>

                        {a.note && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Not:</span> {a.note}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        disabled={!canCancel || busyId === a.id}
                        onClick={() => handleCancel(a.id)}
                      >
                        {busyId === a.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Geçmiş</CardTitle>
              <CardDescription>Tamamlanan veya iptal edilen randevular.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  Geçmiş kayıt yok.
                </div>
              )}

              {history.map((a) => (
                <div key={a.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{a.service.name}</div>
                        <Badge variant={statusVariant(a.status)}>{statusBadge(a.status)}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatDateTimeTR(a.startAt)}
                        <span className="mx-2">•</span>
                        {formatTimeHour(a.startAt)} → {formatTimeHour(a.endAt)}
                        <span className="mx-2">•</span>
                        {a.service.durationMin} dk
                        {a.service.price != null ? (
                          <>
                            <span className="mx-2">•</span> ₺{a.service.price}
                          </>
                        ) : null}
                      </div>
                      {a.note && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Müşteri Notu:</span> {a.note}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAppt(a);
                        setDetailOpen(true);
                      }}
                    >
                      Detay
                    </Button>

                  </div>
                </div>
              ))}

              <AppointmentDetailsModal
                open={detailOpen}
                onOpenChange={(o) => {
                  setDetailOpen(o);
                  if (!o) setSelectedAppt(null);
                }}
                appointment={selectedAppt}
                formatDate={formatDateTimeTR}
              
              />
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}
