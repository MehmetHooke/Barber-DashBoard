// src/pages/home/UserHome.tsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";


import { getMyAppointments, cancelAppointment, type Appointment } from "../api/appointments";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";


type AnyStatus = Appointment["status"];

function toDate(d: string | Date) {
  return d instanceof Date ? d : new Date(d);
}

function formatDateTR(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeTR(date: Date) {
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatPriceTRY(amount?: number | null) {
  if (typeof amount !== "number") return "—";
  return amount.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function StatusBadge({ status }: { status: AnyStatus }) {
  switch (status) {
    case "CONFIRMED":
      return <Badge className="px-4 py-1" variant="default">Onaylandı</Badge>;
    case "PENDING":
      return <Badge className="px-4 py-1" variant="secondary">Beklemede</Badge>;
    case "CANCELLED":
      return <Badge className="px-4 py-1" variant="destructive">İptal</Badge>;
    case "DONE":
      return <Badge className="px-4 py-1" variant="outline">Tamamlandı</Badge>;
    default:
      return <Badge className="px-4 py-1" variant="secondary">Durum</Badge>;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Bir sorun oluştu</CardTitle>
        <CardDescription className="text-muted-foreground">{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Button variant="default" onClick={onRetry}>
          Tekrar Dene
        </Button>
        <Button asChild variant="secondary">
          <Link to="/book">Randevu Al</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function UserHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedAppt, setSelectedAppt] = React.useState<any | null>(null);

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

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const appts = await getMyAppointments();
      setAppointments(appts);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Randevular alınamadı. Backend çalışıyor mu ve token geçerli mi kontrol et.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const sortedAsc = [...appointments].sort(
    (a, b) => toDate(a.startAt).getTime() - toDate(b.startAt).getTime()
  );

  const upcoming =
    sortedAsc.find((a) => {
      const start = toDate(a.startAt);
      return start.getTime() >= now.getTime() && a.status !== "CANCELLED";
    }) ?? null;

  const recent = [...appointments]
    .filter((a) => toDate(a.startAt).getTime() < now.getTime())
    .sort((a, b) => toDate(b.startAt).getTime() - toDate(a.startAt).getTime())
    .slice(0, 3);

  async function handleCancel(id: string) {
    try {
      setCancelingId(id);
      await cancelAppointment(id);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "İptal başarısız.";
      setError(msg);
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return <ErrorCard message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Yaklaşan randevun</CardTitle>
          <CardDescription className="text-muted-foreground">
            En yakın randevu bilgilerin burada.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {upcoming ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {formatDateTR(toDate(upcoming.startAt))} • {formatTimeTR(toDate(upcoming.startAt))}
                  </div>
                  <div className="text-base">
                    <span className="font-medium">Berber</span>
                    <span className="text-muted-foreground"> • </span>
                    <span>{upcoming.service?.name ?? "Hizmet"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ücret: {formatPriceTRY(upcoming.service?.price ?? null)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={upcoming.status} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      size="lg"
                      variant="default"
                      onClick={() => {
                        setSelectedAppt(upcoming);
                        setDetailOpen(true);
                      }}
                    >
                      Detay
                    </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCancel(upcoming.id)}
                  disabled={cancelingId === upcoming.id}
                >
                  {cancelingId === upcoming.id ? "İptal ediliyor..." : "İptal"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium">Henüz randevun yok</div>
                <div className="text-sm text-muted-foreground">
                  Hemen bir randevu oluştur, saatini seç ve onayla.
                </div>
              </div>
              <Button asChild variant="default">
                <Link to="/book">Randevu Al</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Recent */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Son randevular</CardTitle>
          <CardDescription className="text-muted-foreground">Son 3 randevunuz aşağıda listelenmiştir.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {recent.length ? (
            recent.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.service?.name ?? "Hizmet"}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTR(toDate(a.startAt))} • {formatTimeTR(toDate(a.startAt))}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Henüz geçmiş randevu kaydın görünmüyor.</div>
          )}

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
  );
}
