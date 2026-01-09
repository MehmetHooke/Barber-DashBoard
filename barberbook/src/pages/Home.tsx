// src/pages/HomePage.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import UserHome from "./UserHome";
import BerberHome from "./BerberHome";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

function LoadingHome() {
  return (
    <PageShell>
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    </PageShell>
  );
}

function GuestHome() {
  return (
    <PageShell>
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">BarberBook ile randevu almak çok kolay</CardTitle>
            <CardDescription className="text-muted-foreground">
              Hizmet seç → saat seç → onayla. Light/Dark tema ile uyumlu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="default">
              <Link to="/book">Randevu Al</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/login">Giriş Yap / Kayıt Ol</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "1) Hizmet seç", d: "Saç, sakal, bakım… ihtiyacını belirle." },
            { t: "2) Saat seç", d: "Uygun saatlerden birini seç ve devam et." },
            { t: "3) Onayla", d: "Bilgileri kontrol et, randevunu kesinleştir." },
          ].map((x) => (
            <Card key={x.t} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{x.t}</CardTitle>
                <CardDescription className="text-muted-foreground">{x.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const isBarber = user?.role === "BARBER";

  if (loading) return <LoadingHome />;

  return (
    <PageShell>
      {!user ? (
        <GuestHome />
      ) : isBarber ? (
        <BerberHome />
      ) : (
        <UserHome />
      )}
    </PageShell>
  );
}
