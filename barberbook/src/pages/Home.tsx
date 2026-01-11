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
import GuestHome from "./GuestHome";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground overflow-x-hidden">
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



export default function HomePage() {
  const { user, loading } = useAuth();
  const isBarber = user?.role === "BARBER";

  if (loading) return <LoadingHome />;

  return (
    <PageShell>
      {!user ? <GuestHome /> : isBarber ? <BerberHome /> : <UserHome />}
    </PageShell>
  );
}
