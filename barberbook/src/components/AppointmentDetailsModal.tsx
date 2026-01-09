
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";

type AppointmentForModal = {
    id: string;
    service: {
        name: string;
        durationMin: number;
        price: number | null;
        status: AppointmentStatus;
    };
};

function statusLabel(status: AppointmentStatus) {
    switch (status) {
        case "CONFIRMED":
            return "Onaylandı";
        case "PENDING":
            return "Beklemede";
        case "CANCELLED":
            return "İptal";
        case "DONE":
            return "Tamamlandı";
        default:
            return "Durum";
    }
}

function statusVariant(status: AppointmentStatus) {
    switch (status) {
        case "CANCELLED":
            return "destructive" as const;
        case "DONE":
            return "default" as const;
        case "CONFIRMED":
            return "secondary" as const;
        case "PENDING":
        default:
            return "outline" as const;
    }
}
function currencyTRY(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
}

export default function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  formatDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  formatDate: (iso: string) => string;
}) {
  if (!appointment) return null;

  const { service, status, startAt } = appointment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Randevu Detayı</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* TARİH */}
          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Tarih</div>
            <div className="mt-1 font-semibold">
              {formatDate(startAt)}
            </div>
          </div>

          {/* HİZMET */}
          <div className="rounded-xl border p-4">
            <div className="text-sm text-muted-foreground">Hizmet</div>
            <div className="mt-1 text-base font-semibold">
              {service.name}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Ücret</div>
              <div className="mt-1 font-semibold">
                {service.price == null ? "—" : `₺${service.price}`}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Süre</div>
              <div className="mt-1 font-semibold">
                {service.durationMin} dk
              </div>
            </div>
          </div>

          {/* DURUM */}
          <div className="rounded-xl border p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Durum</div>
              <div className="mt-1 font-semibold">
                {statusLabel(status)}
              </div>
            </div>

            <Badge variant={statusVariant(status)}>
              {statusLabel(status)}
            </Badge>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            className="w-40"
            onClick={() => onOpenChange(false)}
          >
            Tamam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
