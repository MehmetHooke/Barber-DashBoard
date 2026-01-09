// src/pages/home/BerberHome.tsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getAdminAppointments,
  updateAppointmentStatus,
  type AdminAppointment,
} from "../api/adminAppointments";

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

type AnyStatus = AdminAppointment["status"];

function toDate(d: string | Date) {
  return d instanceof Date ? d : new Date(d);
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-40" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-10 w-72" />
        </CardContent>
      </Card>
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
          <Link to="/barber">Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BerberHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [todayAppointments, setTodayAppointments] = React.useState<AdminAppointment[]>([]);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const all = await getAdminAppointments();
      const today = new Date();
      const todays = all
        .filter((a) => isSameLocalDay(toDate(a.startAt), today))
        .sort((a, b) => toDate(a.startAt).getTime() - toDate(b.startAt).getTime());

      setTodayAppointments(todays);
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
  const sorted = [...todayAppointments].sort(
    (a, b) => toDate(a.startAt).getTime() - toDate(b.startAt).getTime()
  );

  const active =
    sorted.find((a) => {
      const s = toDate(a.startAt);
      const e = toDate(a.endAt);
      const inRange = now >= s && now <= e;
      return inRange && (a.status === "CONFIRMED" || a.status === "PENDING");
    }) ?? null;

  const nextUp =
    sorted.find((a) => toDate(a.startAt).getTime() > now.getTime() && (a.status === "PENDING" || a.status === "CONFIRMED")) ??
    null;

  const remainingCount = sorted.filter((a) => {
    const s = toDate(a.startAt);
    const isLaterOrNow = s.getTime() >= now.getTime();
    return isLaterOrNow && (a.status === "PENDING" || a.status === "CONFIRMED");
  }).length;

  const nextThree = sorted
    .filter((a) => toDate(a.startAt).getTime() > now.getTime() && (a.status === "PENDING" || a.status === "CONFIRMED"))
    .slice(0, 3);

  async function setStatus(id: string, status: "CONFIRMED" | "CANCELLED" | "DONE") {
    try {
      setActionLoadingId(id);
      await updateAppointmentStatus(id, status);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Durum güncellenemedi.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  }

  function callCustomer(id: string) {
    // placeholder (istersen burada toast/notify entegre ederiz)
    // eslint-disable-next-line no-console
    console.log("call", id);
  }

  if (loading) return <LoadingSkeleton />;

  if (error) return <ErrorCard message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {/* Mini status strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Şu an</CardDescription>
            <CardTitle className="text-base">{active ? "Aktif randevu var" : "Boş"}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Sıradaki</CardDescription>
            <CardTitle className="text-base">
              {nextUp ? `${nextUp.user?.name ?? "Müşteri"} • ${formatTimeTR(toDate(nextUp.startAt))}` : "Sırada Müşteriniz Yok"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Bugün kalan</CardDescription>
            <CardTitle className="text-base">{remainingCount} randevu</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Bekleyen / geç kalan</CardDescription>
            <CardTitle className="text-base">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Now card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Şimdi</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gelir yok — operasyon odaklı ekran.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {active ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {formatDateTR(toDate(active.startAt))} • {formatTimeTR(toDate(active.startAt))} -{" "}
                    {formatTimeTR(toDate(active.endAt))}
                  </div>

                  <div className="text-base">
                    <span className="font-medium">{active.user?.name ?? "Müşteri"}</span>
                    <span className="text-muted-foreground"> • </span>
                    <span>{active.service?.name ?? "Hizmet"}</span>
                  </div>

                  <div className="text-sm text-muted-foreground">Not: {active.note ? active.note : "—"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={active.status} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="default"
                  onClick={() => setStatus(active.id, "CONFIRMED")}
                  disabled={actionLoadingId === active.id}
                >
                  {actionLoadingId === active.id ? "İşleniyor..." : "Başlat"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setStatus(active.id, "DONE")}
                  disabled={actionLoadingId === active.id}
                >
                  Tamamlandı
                </Button>

                {/* Backend’de NOSHOW yok => şimdilik CANCELLED */}
                <Button
                  variant="outline"
                  onClick={() => setStatus(active.id, "CANCELLED")}
                  disabled={actionLoadingId === active.id}
                >
                  No-show
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setStatus(active.id, "CANCELLED")}
                  disabled={actionLoadingId === active.id}
                >
                  İptal
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium">Şu an boş</div>
                <div className="text-sm text-muted-foreground">Bugünkü listeyi kontrol edip sırayı yönetebilirsin.</div>
              </div>
              <Button variant="default" onClick={() => navigate("/barber")}>
                Bugünkü listeyi gör
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next 3 */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Sıradaki 3 kişi</CardTitle>
          <CardDescription className="text-muted-foreground">Her satırda “Çağır” butonu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nextThree.length ? (
            nextThree.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {formatTimeTR(toDate(a.startAt))} — {a.user?.name ?? "Müşteri"}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{a.service?.name ?? "Hizmet"}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => callCustomer(a.id)}>
                  Çağır
                </Button>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Sırada kimse yok.</div>
          )}
        </CardContent>
      </Card>

      {/* Today list + CTA */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Bugün</CardTitle>
            <CardDescription className="text-muted-foreground">
              Detaylar Dashboard’da.
            </CardDescription>
          </div>
          <Button asChild variant="default">
            <Link to="/barber">Detaylı Dashboard’a Git</Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          {sorted.length ? (
            sorted.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {formatTimeTR(toDate(a.startAt))} - {formatTimeTR(toDate(a.endAt))} •{" "}
                    {a.user?.name ?? "Müşteri"} • {a.service?.name ?? "Hizmet"}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDateTR(toDate(a.startAt))}</div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Bugün için randevu görünmüyor.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
