import { useEffect, useMemo, useState } from "react";
import { getAnalyticsSummary, type AnalyticsRange, type AnalyticsSummary } from "../api/analytics";
import { updateAppointmentStatus } from "../api/adminAppointments";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ManageServicesDialog from "@/components/ManageServicesDialog";

function currencyTRY(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}
function percent(v: number) {
  return `${Math.round(v * 100)}%`;
}
function deltaLabel(d: number) {
  if (!Number.isFinite(d)) return "0%"; // NaN, Infinity, -Infinity
  const p = Math.round(d * 100);
  if (p === 0) return "0%";
  return p > 0 ? `+${p}%` : `${p}%`;
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "PENDING") return "secondary";
  if (status === "DONE") return "outline";
  return "destructive"; // CANCELLED
}

export default function BarberDashboard() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyApptId, setBusyApptId] = useState<string | null>(null);



  async function load(r: AnalyticsRange) {
    setLoading(true);
    setError(null);


    try {
      const res = await getAnalyticsSummary(r);
      setData(res);




    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Analytics yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }
  const revenueChartConfig = {
    realized: { label: "Gelir", color: "var(--chart-1)" },
  } satisfies ChartConfig;


  const trShort = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" });
  const trLong = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  function parseYmdToDate(ymd: string) {
    // "2026-01-03" -> Date (local)
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatShortTRDate(ymd: string) {
    return trShort.format(parseYmdToDate(ymd)); // "03 Oca"
  }

  function formatLongTRDate(ymd: string) {
    return trLong.format(parseYmdToDate(ymd)); // "03 Ocak 2026"
  }


  function rangeLabel(r: AnalyticsRange) {
    if (r === "today") return "Today";
    if (r === "7d") return "Last 7 days";
    return "Last 30 days";
  }

  const revenueChartData = useMemo(() => {
    if (!data) return [];
    const base = data.series.revenueDaily;
    if (range === "30d") return base;
    if (range === "7d") return base.slice(-7);
    return base.slice(-1);
  }, [data, range]);


  const rangeRealizedRevenue = useMemo(() => {
    if (!data) return 0;
    return revenueChartData.reduce((sum, x) => sum + (x.realized ?? 0), 0);
  }, [data, revenueChartData]);



  const rangeAppointments = useMemo(() => {
    if (!data) return 0;
    // statusCounts içindeki tüm statülerin toplamı = seçili aralık randevu sayısı
    return Object.values(data.series.statusCounts ?? {}).reduce((s, n) => s + (n ?? 0), 0);
  }, [data]);


  const STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",   // amber-500
    CONFIRMED: "#3b82f6", // blue-500
    DONE: "#22c55e",      // green-500
    CANCELLED: "#ef4444", // red-500
  };
  function statusColor(status: string) {
    return STATUS_COLORS[status] ?? "#94a3b8"; // slate-400 fallback
  }


  async function changeStatus(id: string, status: "CONFIRMED" | "DONE" | "CANCELLED") {
    if (status === "CANCELLED") {
      const ok = confirm("Randevuyu iptal etmek istiyor musun?");
      if (!ok) return;
    }

    setBusyApptId(id);
    setError(null);
    try {
      await updateAppointmentStatus(id, status);
      await load(range); // dashboard refresh
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Status güncellenemedi.");
    } finally {
      setBusyApptId(null);
    }
  }


  useEffect(() => {
    load(range);
  }, [range]);

  const statusPieData = useMemo(() => {
    const counts = data?.series.statusCounts ?? {};
    const keys = Object.keys(counts);
    return keys.map((k) => ({ name: k, value: counts[k] }));
  }, [data]);

  const hasAnyData =
    !!data &&
    (data.kpis.todayAppointments > 0 ||
      data.kpis.todayRevenue > 0 ||
      data.series.revenueDaily.some((x) => (x.planned ?? 0) > 0 || (x.realized ?? 0) > 0)
    );

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gelir, randevular ve günlük operasyonlar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as AnalyticsRange)}
          >
            <ToggleGroupItem value="today">Today</ToggleGroupItem>
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
            <ToggleGroupItem value="30d">30d</ToggleGroupItem>
          </ToggleGroup>

          <Button variant="outline" onClick={() => load(range)} disabled={loading}>
            Refresh
          </Button>

          <Button onClick={() => alert("V2: Barber creates appointment")}>New appointment</Button>
          <ManageServicesDialog onChanged={() => load(range)} />
        </div>
      </div>

      {error && (
        <Card className="mt-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* KPI */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
            </Card>
          ))
        ) : (
          <>
            {/* 1) Revenue (Realized) */}
            <Card>
              <CardHeader>
                <CardDescription>{rangeLabel(range)} Revenue</CardDescription>
                <CardTitle className="text-2xl">{currencyTRY(rangeRealizedRevenue)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {deltaLabel(data.deltas.rangeRealizedRevenueDelta)} vs previous period
              </CardContent>
            </Card>

            {/* 2) Appointments */}
            <Card>
              <CardHeader>
                <CardDescription>{rangeLabel(range)} Appointments</CardDescription>
                <CardTitle className="text-2xl">{rangeAppointments}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {deltaLabel(data.deltas.rangeAppointments)} vs previous period
              </CardContent>
            </Card>

            {/* 3) Month revenue */}
            <Card>
              <CardHeader>
                <CardDescription>Bu Ay Toplam Gelir</CardDescription>
                <CardTitle className="text-2xl">{currencyTRY(data.kpis.monthRevenue)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {deltaLabel(data.deltas.monthRevenue)} vs last month
              </CardContent>
            </Card>

            {/* 4) Cancel rate */}
            <Card>
              <CardHeader>
                <CardDescription>İptal Oranı (30 gün)</CardDescription>
                <CardTitle className="text-2xl">{percent(data.kpis.cancelRate30d)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {deltaLabel(data.deltas.cancelRate30d)} vs prev 30d
              </CardContent>
            </Card>
          </>


        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue ({rangeLabel(range)})</CardTitle>
            <CardDescription>Gelir trendi</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart
                accessibilityLayer
                data={revenueChartData}
                margin={{ left: 8, right: 12, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />

                <XAxis

                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={16}
                  tickFormatter={formatShortTRDate}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => formatLongTRDate(label)}
                      formatter={(value) => ["Gelir ", currencyTRY(Number(value))]}
                    />
                  }
                />

                <defs>
                  <linearGradient id="fillRealized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="55%" stopColor="var(--color-realized)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-realized)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="realized"
                  type="monotone"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  fill="url(#fillRealized)"
                  stroke="var(--color-realized)"
                />


                {/* realized'i line olarak daha okunaklı yapalım */}
                <Line
                  type="monotone"
                  dataKey="realized"
                  stroke="var(--color-realized)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>

        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Seçili aralıkta durum dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : statusPieData.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Bu aralıkta randevu yok.
              </div>
            ) : (
              <div className="grid items-center gap-4 md:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPieData} dataKey="value" nameKey="name" outerRadius={90}>
                        {statusPieData.map((s) => (
                          <Cell key={s.name} fill={statusColor(s.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {statusPieData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between rounded-lg border p-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: statusColor(s.name) }} />
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <Badge variant="secondary">{s.value}</Badge>
                    </div>

                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today appointments */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Today appointments</CardTitle>
          <CardDescription>Bugün gelen randevular</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <Skeleton className="h-52 w-full" />
          ) : data.todayAppointments.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <div className="text-sm text-muted-foreground">Bugün randevu yok.</div>
              <Button className="mt-4" onClick={() => alert("V2: Create appointment")}>
                Create appointment
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Saat</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Hizmet</TableHead>
                    <TableHead className="w-28">Ücret</TableHead>
                    <TableHead className="w-28">Durum</TableHead>
                    <TableHead className="w-56 text-right">Aksiyon</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.todayAppointments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.time}</TableCell>
                      <TableCell>
                        <div className="font-medium">{a.customerName}</div>
                        <div className="text-xs text-muted-foreground">{a.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{a.serviceName}</div>
                        <div className="text-xs text-muted-foreground">{a.durationMin} dk</div>
                      </TableCell>
                      <TableCell>{a.price == null ? "—" : currencyTRY(a.price)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(a.status)}>{a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyApptId === a.id || a.status === "CONFIRMED" || a.status === "DONE" || a.status === "CANCELLED"}
                            onClick={() => changeStatus(a.id, "CONFIRMED")}
                          >
                            {busyApptId === a.id ? "..." : "Confirm"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyApptId === a.id || a.status === "DONE" || a.status === "CANCELLED"}
                            onClick={() => changeStatus(a.id, "DONE")}
                          >
                            {busyApptId === a.id ? "..." : "Done"}
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyApptId === a.id || a.status === "CANCELLED" || a.status === "DONE"}
                            onClick={() => changeStatus(a.id, "CANCELLED")}
                          >
                            {busyApptId === a.id ? "..." : "Cancel"}
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator className="my-4" />

          {!loading && data && !hasAnyData && (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <div className="text-base font-medium">Henüz veri yok</div>
              <div className="mt-1 text-sm text-muted-foreground">
                İlk randevular geldikçe dashboard otomatik dolacak.
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => alert("V2: Create appointment")}>Randevu oluştur</Button>
                <Button variant="outline" onClick={() => setRange("30d")}>
                  Son 30 gün
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
