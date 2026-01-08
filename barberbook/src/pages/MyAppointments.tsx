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
import { Separator } from "@/components/ui/separator";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
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

  const upcoming = useMemo(
    () => items.filter((a) => a.status !== "CANCELLED" && a.status !== "DONE"),
    [items]
  );
  const history = useMemo(
    () => items.filter((a) => a.status === "CANCELLED" || a.status === "DONE"),
    [items]
  );

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
          <h1 className="text-2xl font-semibold tracking-tight">My appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Randevularını gör, iptal et ve geçmişi takip et.
          </p>
        </div>

        <Button variant="outline" onClick={load} disabled={loading}>
          Refresh
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
            <CardTitle>No appointments</CardTitle>
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
              <CardTitle>Upcoming</CardTitle>
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
                          <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground">
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
              <CardTitle>History</CardTitle>
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
                        <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
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
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Not:</span> {a.note}
                        </div>
                      )}
                    </div>

                    <Button variant="outline" disabled>
                      View
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />
              <p className="text-xs text-muted-foreground">
                Not: History bölümündeki “View” butonu v2’de detay sayfasına gidebilir.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
