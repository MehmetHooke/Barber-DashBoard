import { http } from "./http";

export type AnalyticsRange = "today" | "7d" | "30d";

export type AnalyticsSummary = {
  range: AnalyticsRange;
  kpis: {
    todayRevenue: number; // realized (DONE)
    todayAppointments: number;
    monthRevenue: number; // realized (DONE)
    cancelRate30d: number; // 0..1
  };
  deltas: {
    todayRevenue: number;
    todayAppointments: number;
    monthRevenue: number;
    cancelRate30d: number;

    // mevcut vardı:
    rangeAppointments: number;

    // NEW: planned ve realized ayrı
    rangePlannedRevenueDelta: number;   // delta planned revenue
    rangeRealizedRevenueDelta: number;  // delta realized revenue
  };
  series: {
    revenueDaily: { date: string; planned: number; realized: number }[];
    statusCounts: Record<string, number>;
  };
  appointments?: Array<{
    id: string;
    startAt: string;     // <-- BUNU EKLE (çok önemli)
    endAt: string;       // <-- BUNU EKLE (çok önemli)
    customerName: string;
    customerEmail: string;
    serviceName: string;
    durationMin: number;
    price: number | null;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
    }>;
  
  todayAppointments?: Array<{
    id: string;
    time: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    durationMin: number;
    price: number | null;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
  }>;
};

export async function getAnalyticsSummary(range: AnalyticsRange) {
  const res = await http.get<AnalyticsSummary>("/analytics/summary", {
    params: { range },
  });
  return res.data;
}
