import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/requireAuth.js";

type RangeKey = "today" | "7d" | "30d";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function fmtYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function safeRate(n: number, d: number) {
  return d <= 0 ? 0 : n / d;
}
function safeDelta(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 1;
  return (curr - prev) / prev;
}

function pickRange(range: RangeKey) {
  const now = new Date();

  if (range === "today") {
    const currStart = startOfDay(now);
    const currEnd = endOfDay(now);

    const prevDay = addDays(now, -1);
    const prevStart = startOfDay(prevDay);
    const prevEnd = endOfDay(prevDay);

    return { range, currStart, currEnd, prevStart, prevEnd };
  }

  const days = range === "7d" ? 7 : 30;

  const currStart = startOfDay(addDays(now, -(days - 1)));
  const currEnd = endOfDay(now);

  const prevEnd = endOfDay(addDays(currStart, -1));
  const prevStart = startOfDay(addDays(prevEnd, -(days - 1)));

  return { range, currStart, currEnd, prevStart, prevEnd };
}

export async function analyticsSummary(req: AuthRequest, res: Response) {
  const range = (req.query.range as RangeKey) ?? "30d";
  if (!["today", "7d", "30d"].includes(range)) {
    return res.status(400).json({ message: "Invalid range. Use today|7d|30d" });
  }

  const { currStart, currEnd, prevStart, prevEnd } = pickRange(range);
  const now = new Date();

  // Planned revenue: CONFIRMED + DONE
  const plannedStatuses = ["CONFIRMED", "DONE"] as const;
  // Realized revenue: DONE only
  const realizedStatuses = ["DONE"] as const;

  // ---- KPI: Today revenue & count ----
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [todayPlannedAgg, todayRealizedAgg, todayCountAgg] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.count({
      where: { startAt: { gte: todayStart, lte: todayEnd } },
    }),
  ]);

  const todayPlannedRevenue = Number(todayPlannedAgg._sum.priceSnapshot ?? 0);
  const todayRealizedRevenue = Number(todayRealizedAgg._sum.priceSnapshot ?? 0);
  const todayAppointments = Number(todayCountAgg);

  // Yesterday deltas
  const yStart = startOfDay(addDays(now, -1));
  const yEnd = endOfDay(addDays(now, -1));

  const [yPlannedAgg, yRealizedAgg, yCountAgg] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: yStart, lte: yEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: yStart, lte: yEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.count({
      where: { startAt: { gte: yStart, lte: yEnd } },
    }),
  ]);

  const yesterdayPlannedRevenue = Number(yPlannedAgg._sum.priceSnapshot ?? 0);
  const yesterdayRealizedRevenue = Number(yRealizedAgg._sum.priceSnapshot ?? 0);
  const yesterdayAppointments = Number(yCountAgg);

  // ---- KPI: Month revenue (planned + realized) ----
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = now;

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [mPlannedAgg, pmPlannedAgg, mRealizedAgg, pmRealizedAgg] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: monthStart, lte: monthEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: prevMonthStart, lte: prevMonthEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: monthStart, lte: monthEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: prevMonthStart, lte: prevMonthEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
  ]);

  const monthPlannedRevenue = Number(mPlannedAgg._sum.priceSnapshot ?? 0);
  const prevMonthPlannedRevenue = Number(pmPlannedAgg._sum.priceSnapshot ?? 0);

  const monthRealizedRevenue = Number(mRealizedAgg._sum.priceSnapshot ?? 0);
  const prevMonthRealizedRevenue = Number(pmRealizedAgg._sum.priceSnapshot ?? 0);

  // (UI istersen planned veya realized gösterebilir; v1’de planned’i month revenue diye döndüm)
  const monthRevenue = monthPlannedRevenue;
  const prevMonthRevenue = prevMonthPlannedRevenue;

  // ---- KPI: Cancel rate (last 30d) ----
  const last30Start = startOfDay(addDays(now, -29));
  const last30End = endOfDay(now);

  const [cancelled30, total30] = await Promise.all([
    prisma.appointment.count({
      where: {
        startAt: { gte: last30Start, lte: last30End },
        status: "CANCELLED",
      },
    }),
    prisma.appointment.count({
      where: { startAt: { gte: last30Start, lte: last30End } },
    }),
  ]);

  const cancelRate30d = safeRate(cancelled30, total30);

  // prev 30d cancel rate delta
  const prev30End = endOfDay(addDays(last30Start, -1));
  const prev30Start = startOfDay(addDays(prev30End, -29));

  const [cancelledPrev30, totalPrev30] = await Promise.all([
    prisma.appointment.count({
      where: { startAt: { gte: prev30Start, lte: prev30End }, status: "CANCELLED" },
    }),
    prisma.appointment.count({
      where: { startAt: { gte: prev30Start, lte: prev30End } },
    }),
  ]);

  const cancelRatePrev30 = safeRate(cancelledPrev30, totalPrev30);

  // ---- Range deltas for planned/realized revenue & count ----
  const [
    currPlannedAgg,
    prevPlannedAgg,
    currRealizedAgg,
    prevRealizedAgg,
    currCount,
    prevCount,
    currCancelledValueAgg,
    prevCancelledValueAgg,
  ] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: currStart, lte: currEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: prevStart, lte: prevEnd },
        status: { in: plannedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: currStart, lte: currEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: prevStart, lte: prevEnd },
        status: { in: realizedStatuses as any },
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.count({ where: { startAt: { gte: currStart, lte: currEnd } } }),
    prisma.appointment.count({ where: { startAt: { gte: prevStart, lte: prevEnd } } }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: currStart, lte: currEnd },
        status: "CANCELLED",
      },
      _sum: { priceSnapshot: true },
    }),
    prisma.appointment.aggregate({
      where: {
        startAt: { gte: prevStart, lte: prevEnd },
        status: "CANCELLED",
      },
      _sum: { priceSnapshot: true },
    }),
  ]);

  const currPlanned = Number(currPlannedAgg._sum.priceSnapshot ?? 0);
  const prevPlanned = Number(prevPlannedAgg._sum.priceSnapshot ?? 0);

  const currRealized = Number(currRealizedAgg._sum.priceSnapshot ?? 0);
  const prevRealized = Number(prevRealizedAgg._sum.priceSnapshot ?? 0);

  const currCancelledValue = Number(currCancelledValueAgg._sum.priceSnapshot ?? 0);
  const prevCancelledValue = Number(prevCancelledValueAgg._sum.priceSnapshot ?? 0);

  // ---- Series: revenueDaily (last 30 days) planned vs realized ----
  // Pull CONFIRMED + DONE for planned; DONE subset for realized
  const apptsFor30 = await prisma.appointment.findMany({
    where: {
      startAt: { gte: last30Start, lte: last30End },
      status: { in: ["CONFIRMED", "DONE"] as any },
    },
    select: { startAt: true, priceSnapshot: true, status: true },
  });

  const plannedMap = new Map<string, number>();
  const realizedMap = new Map<string, number>();

  for (let i = 0; i < 30; i++) {
    const day = fmtYMD(addDays(last30Start, i));
    plannedMap.set(day, 0);
    realizedMap.set(day, 0);
  }

  for (const a of apptsFor30) {
    const day = fmtYMD(a.startAt);
    if (!plannedMap.has(day)) continue;

    const price = Number(a.priceSnapshot ?? 0);

    // planned: CONFIRMED + DONE
    plannedMap.set(day, (plannedMap.get(day) ?? 0) + price);

    // realized: DONE only
    if (a.status === "DONE") {
      realizedMap.set(day, (realizedMap.get(day) ?? 0) + price);
    }
  }

  const revenueDaily = Array.from(plannedMap.entries()).map(([date, planned]) => ({
    date,
    planned,
    realized: realizedMap.get(date) ?? 0,
  }));

  // ---- Series: cancelledValueDaily (last 30 days) positive ----
  const cancelledFor30 = await prisma.appointment.findMany({
    where: { startAt: { gte: last30Start, lte: last30End }, status: "CANCELLED" },
    select: { startAt: true, priceSnapshot: true },
  });

  const cancelledMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const day = fmtYMD(addDays(last30Start, i));
    cancelledMap.set(day, 0);
  }
  for (const a of cancelledFor30) {
    const day = fmtYMD(a.startAt);
    if (!cancelledMap.has(day)) continue;
    cancelledMap.set(day, (cancelledMap.get(day) ?? 0) + Number(a.priceSnapshot ?? 0));
  }
  const cancelledValueDaily = Array.from(cancelledMap.entries()).map(([date, value]) => ({ date, value }));

  // ---- Series: statusCounts (current range) ----
  const statusGrouped = await prisma.appointment.groupBy({
    by: ["status"],
    where: { startAt: { gte: currStart, lte: currEnd } },
    _count: { _all: true },
  });

  const statusCounts: Record<string, number> = {};
  for (const row of statusGrouped) statusCounts[row.status] = row._count._all;

  // ---- Today appointments list ----
  const todayItems = await prisma.appointment.findMany({
    where: { startAt: { gte: todayStart, lte: todayEnd } },
    orderBy: { startAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, durationMin: true } },
    },
  });

  const todayAppointmentsList = todayItems.map((a) => {
    const hh = String(a.startAt.getHours()).padStart(2, "0");
    const mm = String(a.startAt.getMinutes()).padStart(2, "0");
    return {
      id: a.id,
      time: `${hh}:${mm}`,
      customerName: a.user.name,
      customerEmail: a.user.email,
      serviceName: a.service.name,
      durationMin: a.service.durationMin,
      price: a.priceSnapshot ?? null,
      status: a.status,
    };
  });

  return res.json({
    range,
    kpis: {
      // existing fields (backward friendly)
      todayRevenue: todayPlannedRevenue,
      todayAppointments,
      monthRevenue,
      cancelRate30d,

      // new (optional)
      todayPlannedRevenue,
      todayRealizedRevenue,
      monthPlannedRevenue,
      monthRealizedRevenue,
      cancelledValueRange: currCancelledValue,
    },
    deltas: {
      // today vs yesterday (planned + realized ayrı)
      todayRevenue: safeDelta(todayPlannedRevenue, yesterdayPlannedRevenue),
      todayAppointments: safeDelta(todayAppointments, yesterdayAppointments),
      monthRevenue: safeDelta(monthRevenue, prevMonthRevenue),

      // cancel rate
      cancelRate30d:
        cancelRatePrev30 === 0
          ? (cancelRate30d === 0 ? 0 : 1)
          : (cancelRate30d - cancelRatePrev30) / cancelRatePrev30,

      // range deltas (UI’da kullanırsın)
      rangeRevenue: safeDelta(currPlanned, prevPlanned),
      rangeAppointments: safeDelta(currCount, prevCount),

      // new: planned/realized ayrı
      rangePlannedRevenueDelta: safeDelta(currPlanned, prevPlanned),
      rangeRealizedRevenueDelta: safeDelta(currRealized, prevRealized),
      cancelledValueDelta: safeDelta(currCancelledValue, prevCancelledValue),
    },
    series: {
      // revenueDaily artık { date, planned, realized }
      revenueDaily,
      cancelledValueDaily,
      statusCounts,
    },
    todayAppointments: todayAppointmentsList,
    meta: {
      today: { start: todayStart.toISOString(), end: todayEnd.toISOString() },
      rangeWindow: { start: currStart.toISOString(), end: currEnd.toISOString() },
    },
  });
}
