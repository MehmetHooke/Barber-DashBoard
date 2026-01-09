import { useEffect, useState } from "react";
import { getServices, type Service } from "../api/services";
import { createServiceAdmin, updateServiceAdmin } from "../api/adminServices";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageServicesDialog({ onChanged }: { onChanged?: () => void }) {
  const [open, setOpen] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", durationMin: 30, price: 0 });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await getServices();
      setServices(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Services yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createServiceAdmin({
        name: form.name.trim(),
        durationMin: Number(form.durationMin),
        price: Number(form.price),
      });
      setForm({ name: "", durationMin: 30, price: 0 });
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Service oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(s: Service) {
    setError(null);
    try {
      await updateServiceAdmin(s.id, { isActive: !s.isActive });
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Güncellenemedi.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Hizmetler</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hizmetler</DialogTitle>
          <DialogDescription>Hizmet ekle, fiyat/süre yönet, aktif/pasif yap.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Create */}
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label>Hizmet ismi</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Saç + Sakal"
              />
            </div>

            <div className="md:col-span-1">
              <Label>Süre (dk)</Label>
              <Input
                type="number"
                min={10}
                max={240}
                value={form.durationMin}
                onChange={(e) => setForm((p) => ({ ...p, durationMin: Number(e.target.value) }))}
              />
            </div>

            <div className="md:col-span-1">
              <Label>Fiyat</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Oluşturuluyor..." : "Hizmet Oluştur"}
            </Button>
          </div>
        </Card>

        {/* List */}
        <div className="space-y-3">
          {loading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}

          {!loading && services.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Henüz servis yok.
            </div>
          )}

          {!loading &&
            services.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{s.name}</div>
                    <Badge variant={s.isActive ? "default" : "outline"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {s.durationMin} dk • {s.price != null ? `₺${s.price}` : "No price"}
                  </div>
                </div>

                <Button variant="outline" onClick={() => toggleActive(s)}>
                  {s.isActive ? "Hizmeti Durdur" : "Hizmeti Aktif Et"}
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
